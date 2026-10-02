import { test, expect } from '@playwright/test';
import Ajv from 'ajv';
import { getAdminCredentials } from '../../utils/helpers.js';

const ajv = new (Ajv as any)({ allErrors: true });

// Strict JSON Schema for Dashboard Shortcuts API
const shortcutsResponseSchema = {
  type: 'object',
  required: ['data'],
  properties: {
    data: {
      type: 'object',
    },
  },
  additionalProperties: true,
};

// Strict JSON Schema for Standard API Error Envelope (404 / 422)
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

test.describe('API Contract — AJV JSON Schema Validation Suite', () => {
  const creds = getAdminCredentials();
  let authCookie = '';

  test.beforeEach(async ({ request }) => {
    // 1. Fetch CSRF token from login page
    const loginPageRes = await request.get('/web/index.php/auth/login');
    const html = await loginPageRes.text();
    const tokenMatch = html.match(/:token="&quot;([^&]+)&quot;"/);
    const csrfToken = tokenMatch ? tokenMatch[1] : '';

    // 2. Perform authentication to retrieve session cookie
    const validateRes = await request.post('/web/index.php/auth/validate', {
      form: {
        _token: csrfToken,
        username: creds.username,
        password: creds.password,
      },
      maxRedirects: 0,
    });

    const rawSetCookie = validateRes.headers()['set-cookie'] || '';
    const match = rawSetCookie.match(/orangehrm=([^;]+)/);
    authCookie = match ? match[1] : '';
  });

  test('[SCHEMA-01] @sanity — Dashboard Shortcuts matches strict AJV JSON schema', async ({ request }) => {
    const response = await request.get('/web/index.php/api/v2/dashboard/shortcuts', {
      headers: {
        Cookie: `orangehrm=${authCookie}`,
      },
    });
    expect(response.status()).toBe(200);

    const body = await response.json();

    // Validate using AJV
    const validate = ajv.compile(shortcutsResponseSchema);
    const valid = validate(body);

    if (!valid) {
      console.error('AJV Schema Errors for Shortcuts:', validate.errors);
    }
    expect(valid).toBe(true);
  });

  test('[SCHEMA-02] @sanity — System Users list matches strict AJV JSON schema', async ({ request }) => {
    const response = await request.get('/web/index.php/api/v2/admin/users?limit=5&offset=0', {
      headers: {
        Cookie: `orangehrm=${authCookie}`,
      },
    });
    expect(response.status()).toBe(200);

    const body = await response.json();

    const usersSchema = {
      type: 'object',
      required: ['data', 'meta'],
      properties: {
        data: { type: 'array' },
        meta: {
          type: 'object',
          required: ['total'],
          properties: {
            total: { type: 'number' },
          },
        },
      },
    };

    const validate = ajv.compile(usersSchema);
    const valid = validate(body);

    if (!valid) {
      console.error('AJV Schema Errors for System Users:', validate.errors);
    }
    expect(valid).toBe(true);
  });

  test('[SCHEMA-03] @validation — Negative Contract: Schema rejects mutated payload with type violation and missing required fields', async ({ request }) => {
    // 1. Fetch genuine live API payload
    const response = await request.get('/web/index.php/api/v2/admin/users?limit=5&offset=0', {
      headers: {
        Cookie: `orangehrm=${authCookie}`,
      },
    });
    expect(response.status()).toBe(200);
    const liveBody = await response.json();

    const strictUsersSchema = {
      type: 'object',
      required: ['data', 'meta'],
      properties: {
        data: { type: 'array' },
        meta: {
          type: 'object',
          required: ['total'],
          properties: {
            total: { type: 'number' }, // Expected to be number
          },
        },
      },
      additionalProperties: true,
    };

    const validate = ajv.compile(strictUsersSchema);

    // Baseline: legitimate response passes
    expect(validate(liveBody)).toBe(true);

    // Negative Mutation 1: Corrupt data type (convert numeric 'total' to string)
    const corruptedTypePayload = JSON.parse(JSON.stringify(liveBody));
    corruptedTypePayload.meta.total = 'INVALID_STRING_TOTAL';

    const isTypeValid = validate(corruptedTypePayload);
    expect(isTypeValid).toBe(false);
    expect(validate.errors).toBeDefined();
    expect(validate.errors!.some((e: any) => e.message?.includes('must be number'))).toBe(true);

    // Negative Mutation 2: Delete required top-level 'data' field
    const missingRequiredPayload = JSON.parse(JSON.stringify(liveBody));
    delete missingRequiredPayload.data;

    const isMissingValid = validate(missingRequiredPayload);
    expect(isMissingValid).toBe(false);
    expect(validate.errors!.some((e: any) => e.message?.includes("must have required property 'data'"))).toBe(true);
  });

  test('[SCHEMA-04] @validation — Negative Contract: 404 Error response fails Success Schema and conforms to Error Schema', async ({ request }) => {
    // 1. Intentionally query a non-existent resource ID to trigger an API error
    const nonExistentResponse = await request.get('/web/index.php/api/v2/admin/users/9999999', {
      headers: {
        Cookie: `orangehrm=${authCookie}`,
      },
    });

    expect(nonExistentResponse.status()).toBe(404);
    const errorBody = await nonExistentResponse.json();

    // 2. Success schema must REJECT the error response (does not have required 'data' array)
    const successSchema = {
      type: 'object',
      required: ['data', 'meta'],
      properties: {
        data: { type: 'array' },
        meta: { type: 'object' },
      },
    };
    const validateSuccess = ajv.compile(successSchema);
    const isSuccessValid = validateSuccess(errorBody);
    expect(isSuccessValid).toBe(false); // Schema correctly fails on error payload

    // 3. Strict Error Schema must ACCEPT the error response
    const validateError = ajv.compile(errorEnvelopeSchema);
    const isErrorValid = validateError(errorBody);
    if (!isErrorValid) {
      console.error('AJV Schema Errors for Error Envelope:', validateError.errors);
    }
    expect(isErrorValid).toBe(true);
    expect(errorBody.error.status).toBe('404');
    expect(errorBody.error.message).toBe('Record Not Found');
  });
});
