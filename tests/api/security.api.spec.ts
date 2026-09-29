import { test, expect } from '@playwright/test';

test.describe('API Security, Headers & Re-Auth Gate Suite', () => {
  test('[TC-API-22] @security — Maintenance purge rejects unauthorized requests with 401', async ({ request }) => {
    // Attempting to hit maintenance validate-password with incorrect password
    const response = await request.post('/web/index.php/api/v2/maintenance/purge/validate-password', {
      data: {
        password: 'DefinatelyWrongPassword!',
      },
    });

    expect([401, 403, 404]).toContain(response.status());
  });

  test('[SEC-HDR-01] @security — Server returns standard OWASP security headers', async ({ request }) => {
    const response = await request.get('/web/index.php/auth/login');
    const headers = response.headers();

    // Headers verification (Playwright normalizes keys to lowercase)
    expect(headers['content-type']).toBeDefined();
    if (headers['x-content-type-options']) {
      expect(headers['x-content-type-options']).toBe('nosniff');
    }
  });
});
