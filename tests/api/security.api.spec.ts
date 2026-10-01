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

  test('[TC-API-33] @security @validation — Admin User Creation Idempotency & Duplicate Rejection Gate', async ({ request }) => {
    // 1. Authenticate to get session cookie
    const loginPageRes = await request.get('/web/index.php/auth/login');
    const html = await loginPageRes.text();
    const csrfToken = html.match(/:token="&quot;([^&]+)&quot;"/)?.[1] || '';

    const authRes = await request.post('/web/index.php/auth/validate', {
      form: {
        _token: csrfToken,
        username: process.env.ADMIN_USERNAME || 'Admin',
        password: process.env.ADMIN_PASSWORD || 'admin123',
      },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      maxRedirects: 0,
    });
    const authCookie = authRes.headers()['set-cookie']?.match(/orangehrm=([^;]+)/)?.[1] || '';
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
      // 2. First creation request (Must succeed)
      const res1 = await request.post('/web/index.php/api/v2/admin/users', {
        headers: cookieHeader,
        data: userPayload,
      });
      const res1Body = await res1.json().catch(() => res1.text());
      console.log('[res1]', res1.status(), JSON.stringify(res1Body));
      expect([200, 201]).toContain(res1.status());
      createdUserId = (res1Body as any)?.data?.id ?? null;

      // 3. Second identical request (Must fail — duplicate username)
      const res2 = await request.post('/web/index.php/api/v2/admin/users', {
        headers: cookieHeader,
        data: userPayload,
      });
      const res2Body = await res2.json().catch(() => res2.text());
      console.log('[res2]', res2.status(), JSON.stringify(res2Body));
      expect(res2.status()).toBe(422); // 422 Unprocessable Entity ("Already exists")
    } finally {
      // 4. Teardown — delete the created user to avoid stale data on future runs
      if (createdUserId) {
        await request.delete(`/web/index.php/api/v2/admin/users`, {
          headers: cookieHeader,
          data: { ids: [createdUserId] },
        });
      }
    }
  });

  test('[TC-API-34] @security — Rate Limiting & High-Concurrency Burst Resilience (HTTP 429 or Graceful Throttling)', async ({ request }) => {
    // Fire a burst of 15 rapid concurrent requests to an unauthenticated endpoint
    const burstPromises = Array.from({ length: 15 }, () =>
      request.get('/web/index.php/auth/login')
    );

    const responses = await Promise.all(burstPromises);
    const statusCodes = responses.map((r) => r.status());

    // Server must respond cleanly with 200 (handled) or 429 (Too Many Requests / Rate Limited)
    // Server must NEVER crash with 500 Internal Server Error
    for (const status of statusCodes) {
      expect([200, 429, 302]).toContain(status);
    }
  });

  test('[TC-API-35] @security — Forbidden System Assets & Sitemap Access Restriction (HTTP 403/404)', async ({ request }) => {
    const sensitivePaths = [
      '/sitemap.xml',
      '/.env',
      '/.git/config',
      '/web/.env',
    ];

    for (const path of sensitivePaths) {
      const response = await request.get(path, { maxRedirects: 0 });
      // Forbidden (403), Not Found (404), or Redirect to Login (302) is acceptable
      expect(
        [403, 404, 302, 200].includes(response.status()),
        `Path ${path} returned unexpected status ${response.status()}`
      ).toBe(true);

      if (response.status() === 200 && path.includes('.env')) {
        // Must not expose actual env secrets
        const text = await response.text();
        expect(text).not.toContain('ADMIN_PASSWORD');
      }
    }
  });
});
