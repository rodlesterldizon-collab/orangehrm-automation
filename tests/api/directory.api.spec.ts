import { test, expect } from '@playwright/test';
import { getAuthCookie } from '../../utils/helpers.js';

test.describe('API Directory & Dashboard Shortcuts Contract Suite', () => {
  let cookieHeader: { Cookie: string };

  test.beforeEach(async ({ request }) => {
    const authCookie = await getAuthCookie(request);
    cookieHeader = { Cookie: `orangehrm=${authCookie}` };
  });

  test('[TC-API-15] @sanity — Directory Employees Card Contract', async ({ request }) => {
    const response = await request.get('/web/index.php/api/v2/directory/employees?limit=15&offset=0', {
      headers: cookieHeader,
    });

    expect(response.status()).toBe(200);
    const body = await response.json();

    expect(body.data).toBeDefined();
    expect(Array.isArray(body.data)).toBe(true);

    if (body.data.length > 0) {
      const card = body.data[0];
      expect(card).toHaveProperty('firstName');
      expect(card).toHaveProperty('lastName');
    }
  });

  test('[TC-API-05] @smoke — Dashboard Quick Launch Shortcuts Contract', async ({ request }) => {
    const response = await request.get('/web/index.php/api/v2/dashboard/shortcuts', {
      headers: cookieHeader,
    });

    expect(response.status()).toBe(200);
    const body = await response.json();

    expect(body.data).toBeDefined();
    expect(body.data).not.toBeNull();
    expect(typeof body.data).toBe('object');

    // Deep check: Verify presence of key dashboard feature flags (using array syntax for keys with literal dots)
    expect(body.data).toHaveProperty(['leave.assign_leave']);
    expect(body.data).toHaveProperty(['leave.apply_leave']);
  });

  test('[TC-API-31] @validation — Directory Search Boundary Handling for Out-of-Range Offset', async ({ request }) => {
    // Large offset returning empty result set gracefully (HTTP 200 with empty array)
    const response = await request.get('/web/index.php/api/v2/directory/employees?limit=14&offset=999999', {
      headers: cookieHeader,
    });

    expect(response.status()).toBe(200);
    const body = await response.json();

    expect(body.data).toBeDefined();
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBe(0);
    expect(body).toHaveProperty('meta');
  });
});
