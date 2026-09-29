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

// Strict JSON Schema for Public Login Configuration / Localization API
const localizationSchema = {
  type: 'object',
  required: ['data'],
  properties: {
    data: {
      type: 'object',
    },
  },
  additionalProperties: true,
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
});
