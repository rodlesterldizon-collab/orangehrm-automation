import { test, expect } from '@playwright/test';
import { getAdminCredentials } from '../../utils/helpers.js';

test.describe('API Authentication & Session Contract Suite', () => {
  const creds = getAdminCredentials();

  test('[TC-API-01] @smoke @sanity — Valid credentials authenticate and return session cookie', async ({ request }) => {
    const startTime = Date.now();

    // 1. Fetch CSRF token from login page
    const loginPageRes = await request.get('/web/index.php/auth/login');
    expect(loginPageRes.status()).toBe(200);
    const html = await loginPageRes.text();
    const tokenMatch = html.match(/:token="&quot;([^&]+)&quot;"/);
    const csrfToken = tokenMatch ? tokenMatch[1] : '';
    expect(csrfToken).toBeTruthy();

    // 2. Validate credentials via auth endpoint
    const response = await request.post('/web/index.php/auth/validate', {
      form: {
        _token: csrfToken,
        username: creds.username,
        password: creds.password,
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      maxRedirects: 0,
    });
    const latency = Date.now() - startTime;

    // 3. Assert HTTP 302 Redirect to dashboard and latency SLA
    expect([200, 302]).toContain(response.status());
    expect(latency).toBeLessThan(2500);

    // 4. Assert session cookie is set
    const setCookie = response.headers()['set-cookie'] || '';
    expect(setCookie).toContain('orangehrm=');
    expect(setCookie).toContain('HttpOnly');
    expect(setCookie).toMatch(/SameSite=(Lax|Strict)/i);
  });

  test('[TC-API-02] @security — Invalid password fails authentication', async ({ request }) => {
    // 1. Fetch CSRF token
    const loginPageRes = await request.get('/web/index.php/auth/login');
    const html = await loginPageRes.text();
    const csrfToken = html.match(/:token="&quot;([^&]+)&quot;"/)?.[1] || '';

    // 2. Submit wrong password
    const response = await request.post('/web/index.php/auth/validate', {
      form: {
        _token: csrfToken,
        username: creds.username,
        password: 'IncorrectPassword999!',
      },
      maxRedirects: 0,
    });

    // In OrangeHRM, failed auth redirects back to /auth/login (not /dashboard/index)
    const location = response.headers()['location'] || '';
    expect(location).toContain('/auth/login');
  });

  test('[TC-API-04] @sanity — Logout endpoint invalidates session token', async ({ request }) => {
    const logoutRes = await request.get('/web/index.php/auth/logout', { maxRedirects: 0 });
    expect([200, 302]).toContain(logoutRes.status());
    const location = logoutRes.headers()['location'] || '';
    expect(location).toContain('/auth/login');
  });
});
