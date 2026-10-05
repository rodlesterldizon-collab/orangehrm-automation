import { test, expect } from '@playwright/test';
import { getAdminCredentials, getAuthCookie } from '../../utils/helpers.js';

test.describe('API Security, Headers & Re-Auth Gate Suite', () => {
  test('[TC-API-22] @security — Administrator password re-authentication gate (/auth/adminVerify)', async ({ request }) => {
    const creds = getAdminCredentials();
    const authCookie = await getAuthCookie(request, creds.username, creds.password);
    const cookieHeader = { Cookie: `orangehrm=${authCookie}` };

    // 1. Access protected maintenance purge endpoint to trigger re-auth challenge
    const challengeRes = await request.get('/web/index.php/maintenance/purgeEmployee', {
      headers: cookieHeader,
    });
    expect(challengeRes.status()).toBe(200);
    const challengeHtml = await challengeRes.text();
    const tokenMatch = challengeHtml.match(/:token="&quot;([^&]+)&quot;"/);
    const csrfToken = tokenMatch ? tokenMatch[1] : '';
    expect(csrfToken).toBeTruthy();

    // 2. Submit incorrect password -> returns HTTP 200 and stays on admin verify challenge
    const invalidVerifyRes = await request.post('/web/index.php/auth/adminVerify', {
      form: {
        _token: csrfToken,
        password: 'IncorrectPassword999!',
      },
      headers: {
        ...cookieHeader,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      maxRedirects: 0,
    });
    expect(invalidVerifyRes.status()).toBe(200);
    const invalidHtml = await invalidVerifyRes.text();
    expect(invalidHtml).toContain('auth-admin-access');
    expect(invalidHtml).toContain('invalid_credentials');

    // 3. Extract fresh CSRF token if present, otherwise reuse existing token
    const freshTokenMatch = invalidHtml.match(/:token="&quot;([^&]+)&quot;"/);
    const validCsrfToken = freshTokenMatch ? freshTokenMatch[1] : csrfToken;

    // 4. Submit correct password -> returns HTTP 302 Found redirecting to /maintenance/purgeEmployee
    const validVerifyRes = await request.post('/web/index.php/auth/adminVerify', {
      form: {
        _token: validCsrfToken,
        password: creds.password,
      },
      headers: {
        ...cookieHeader,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      maxRedirects: 0,
    });
    expect(validVerifyRes.status()).toBe(302);
    const redirectUrl = validVerifyRes.headers()['location'] || '';
    expect(redirectUrl).toContain('/maintenance/purgeEmployee');

    // 5. Follow the redirect to /maintenance/purgeEmployee -> returns HTTP 200
    const purgeRes = await request.get('/web/index.php/maintenance/purgeEmployee', {
      headers: cookieHeader,
    });
    expect(purgeRes.status()).toBe(200);
  });

  test('[SEC-HDR-01] @security — Server returns standard OWASP security headers', async ({ request }) => {
    const response = await request.get('/web/index.php/auth/login');
    const headers = response.headers();

    // Playwright automatically normalizes header keys to lowercase
    expect(headers['content-type']).toBeDefined();
    expect(headers['x-content-type-options']).toBe('nosniff');
  });

  test('[TC-API-33] @security @validation — Admin User Creation Uniqueness & Duplicate Rejection Gate', async ({ request }) => {
    const creds = getAdminCredentials();
    const authCookie = await getAuthCookie(request, creds.username, creds.password);
    const cookieHeader = { Cookie: `orangehrm=${authCookie}` };

    // Fetch a real empNumber — empNumber: 1 may not exist in all environments
    const empRes = await request.get('/web/index.php/api/v2/pim/employees?limit=1', {
      headers: cookieHeader,
    });
    const empBody = await empRes.json();
    const empNumber = empBody?.data?.[0]?.empNumber ?? empBody?.data?.[0]?.employeeId;
    if (!empNumber) throw new Error('No employees found — cannot create user without a valid empNumber');

    // Timestamp + random suffix prevents collisions on retries and parallel runs
    const uniqueId = `IdemUser_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const userPayload = {
      username: uniqueId,
      password: 'StrongPassword123!',
      status: true,
      userRoleId: 1, // Admin
      empNumber,
    };

    let createdUserId: number | null = null;

    try {
      // 1. First creation request (Must succeed)
      const res1 = await request.post('/web/index.php/api/v2/admin/users', {
        headers: cookieHeader,
        data: userPayload,
      });
      const res1Body = await res1.json().catch(() => null);
      expect([200, 201]).toContain(res1.status());
      createdUserId = res1Body?.data?.id ?? null;

      // 2. Second identical request (Must fail — duplicate username)
      const res2 = await request.post('/web/index.php/api/v2/admin/users', {
        headers: cookieHeader,
        data: userPayload,
      });
      expect(res2.status()).toBe(422); // 422 Unprocessable Entity ("Already exists")
    } finally {
      // 3. Teardown — delete the created user to avoid stale data on future runs
      if (createdUserId) {
        await request.delete('/web/index.php/api/v2/admin/users', {
          headers: cookieHeader,
          data: { ids: [createdUserId] },
        });
      }
    }
  });

  test('[TC-API-34] @security — High-Concurrency Burst Resilience (Server returns 200/429 without 5xx errors)', async ({ request }) => {
    // Fire a burst of 15 rapid concurrent requests to an unauthenticated endpoint
    const burstPromises = Array.from({ length: 15 }, () =>
      request.get('/web/index.php/auth/login')
    );

    const responses = await Promise.all(burstPromises);
    const statusCodes = responses.map((r) => r.status());

    for (const status of statusCodes) {
      expect([200, 302, 429]).toContain(status);
      expect(status).toBeLessThan(500); // Verify no 500 server crashes under load
    }
  });

  test('[TC-API-35] @security — Forbidden System Assets Access Restriction (HTTP 403/404/302)', async ({ request }) => {
    const sensitivePaths = [
      '/.env',
      '/.git/config',
      '/web/.env',
    ];

    for (const path of sensitivePaths) {
      const response = await request.get(path, { maxRedirects: 0 });
      const status = response.status();

      // Ensure sensitive configuration files are strictly forbidden, missing, or redirected
      expect(
        [403, 404, 302].includes(status),
        `Sensitive path ${path} exposed with status ${status}`
      ).toBe(true);

      if (status === 302) {
        const location = response.headers()['location'];
        expect(location).toMatch(/login|error/i);
      }
    }

    // Sitemap does not exist on this demo site — verify server returns 403 Forbidden or 404 Not Found
    const sitemapRes = await request.get('/sitemap.xml');
    expect([403, 404].includes(sitemapRes.status())).toBe(true);
  });
});
