import { test, expect } from '@playwright/test';
import Ajv, { type ErrorObject } from 'ajv';
import { getAdminCredentials, getAuthCookie } from '../../utils/helpers.js';

const AjvClass = Ajv as unknown as typeof Ajv.default;
const ajv = new AjvClass({ allErrors: true });

// 1. Precise Schemas Defined at Top-Level
const shortcutsResponseSchema = {
  type: 'object',
  required: ['data'],
  properties: {
    data: {
      type: 'object',
      required: [
        'leave.assign_leave',
        'leave.leave_list',
        'leave.apply_leave',
        'leave.my_leave',
        'time.employee_timesheet',
        'time.my_timesheet',
      ],
      properties: {
        'leave.assign_leave': { type: 'boolean' },
        'leave.leave_list': { type: 'boolean' },
        'leave.apply_leave': { type: 'boolean' },
        'leave.my_leave': { type: 'boolean' },
        'time.employee_timesheet': { type: 'boolean' },
        'time.my_timesheet': { type: 'boolean' },
      },
      additionalProperties: { type: 'boolean' },
    },
  },
  additionalProperties: true,
};

const usersSchema = {
  type: 'object',
  required: ['data', 'meta'],
  properties: {
    data: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'userName'],
        properties: {
          id: { type: 'number' },
          userName: { type: 'string' },
        },
      },
    },
    meta: {
      type: 'object',
      required: ['total'],
      properties: {
        total: { type: 'number' },
      },
    },
  },
  additionalProperties: true,
};

const errorEnvelopeSchema = {
  type: 'object',
  required: ['error'],
  properties: {
    error: {
      type: 'object',
      required: ['status', 'message'],
      properties: {
        status: { type: 'string' },
        message: { type: 'string' },
        data: { type: 'object' },
      },
      additionalProperties: true,
    },
  },
  additionalProperties: false,
};

// Pre-compiled validators for maximum speed
const validateShortcuts = ajv.compile(shortcutsResponseSchema);
const validateUsers = ajv.compile(usersSchema);
const validateError = ajv.compile(errorEnvelopeSchema);

test.describe('API Contract — AJV JSON Schema Validation Suite', () => {
  const creds = getAdminCredentials();
  let authCookie = '';

  test.beforeEach(async ({ request }) => {
    authCookie = await getAuthCookie(request, creds.username, creds.password);
  });

  test('[SCHEMA-01] @sanity — Dashboard Shortcuts matches strict AJV JSON schema', async ({ request }) => {
    const response = await request.get('/web/index.php/api/v2/dashboard/shortcuts', {
      headers: { Cookie: `orangehrm=${authCookie}` },
    });
    expect(response.status()).toBe(200);

    const body = await response.json();
    const valid = validateShortcuts(body);

    if (!valid) {
      console.error('AJV Schema Errors for Shortcuts:', validateShortcuts.errors);
    }
    expect(valid).toBe(true);
  });

  test('[SCHEMA-02] @sanity — System Users list matches strict AJV JSON schema', async ({ request }) => {
    const response = await request.get('/web/index.php/api/v2/admin/users?limit=5&offset=0', {
      headers: { Cookie: `orangehrm=${authCookie}` },
    });
    expect(response.status()).toBe(200);

    const body = await response.json();
    const valid = validateUsers(body);

    if (!valid) {
      console.error('AJV Schema Errors for System Users:', validateUsers.errors);
    }
    expect(valid).toBe(true);
  });

  test('[SCHEMA-03] @validation — Negative Contract: Schema rejects mutated payload with type violation and missing required fields', async ({ request }) => {
    const response = await request.get('/web/index.php/api/v2/admin/users?limit=5&offset=0', {
      headers: { Cookie: `orangehrm=${authCookie}` },
    });
    expect(response.status()).toBe(200);
    const liveBody = await response.json();

    // Baseline check
    expect(validateUsers(liveBody)).toBe(true);

    // Mutation 1: Corrupt total type to string
    const corruptedTypePayload = JSON.parse(JSON.stringify(liveBody));
    corruptedTypePayload.meta.total = 'INVALID_STRING_TOTAL';

    const isTypeValid = validateUsers(corruptedTypePayload);
    expect(isTypeValid).toBe(false);
    expect(validateUsers.errors?.some((e: ErrorObject) => e.message?.includes('must be number'))).toBe(true);

    // Mutation 2: Remove required 'data' field
    const missingRequiredPayload = JSON.parse(JSON.stringify(liveBody));
    delete missingRequiredPayload.data;

    const isMissingValid = validateUsers(missingRequiredPayload);
    expect(isMissingValid).toBe(false);
    expect(validateUsers.errors?.some((e: ErrorObject) => e.message?.includes("must have required property 'data'"))).toBe(true);
  });

  test('[SCHEMA-04] @validation — Negative Contract: 404 Error response fails Success Schema and conforms to Error Schema', async ({ request }) => {
    const nonExistentResponse = await request.get('/web/index.php/api/v2/admin/users/9999999', {
      headers: { Cookie: `orangehrm=${authCookie}` },
    });

    expect(nonExistentResponse.status()).toBe(404);
    const errorBody = await nonExistentResponse.json();

    // 1. Success schema must REJECT the error response
    expect(validateUsers(errorBody)).toBe(false);

    // 2. Strict Error Schema must ACCEPT the error response
    const isErrorValid = validateError(errorBody);
    if (!isErrorValid) {
      console.error('AJV Schema Errors for Error Envelope:', validateError.errors);
    }
    expect(isErrorValid).toBe(true);
    expect(errorBody.error.status).toBe('404');
    expect(errorBody.error.message).toBe('Record Not Found');
  });
});
