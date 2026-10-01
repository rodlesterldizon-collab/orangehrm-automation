import { test, expect } from '@playwright/test';
import { getAuthCookie } from '../../utils/helpers.js';
import { generateUserData } from '../../utils/test-data.js';

test.describe('API Admin User Role & RBAC Contract Suite', () => {
  let cookieHeader: { Cookie: string };

  test.beforeEach(async ({ request }) => {
    const authCookie = await getAuthCookie(request);
    cookieHeader = { Cookie: `orangehrm=${authCookie}` };
  });

  test('[TC-API-11] @smoke — System Users List Contract & Properties', async ({ request }) => {
    const response = await request.get('/web/index.php/api/v2/admin/users?limit=20&offset=0', {
      headers: cookieHeader,
    });

    expect(response.status()).toBe(200);
    const body = await response.json();

    expect(body.data).toBeDefined();
    expect(Array.isArray(body.data)).toBe(true);

    if (body.data.length > 0) {
      const user = body.data[0];
      expect(user).toHaveProperty('userName');
      expect(user).toHaveProperty('userRole');
      expect(user).toHaveProperty('status');
    }
  });

  test('[TC-API-12] @sanity — Create System User with Admin Role', async ({ request }) => {
    const userData = generateUserData('Admin');

    const response = await request.post('/web/index.php/api/v2/admin/users', {
      headers: cookieHeader,
      data: {
        username: userData.username,
        password: userData.password,
        status: true,
        userRoleId: 1, // 1 = Admin
        empNumber: 1,
      },
    });

    // 201 Created or 200 depending on demo state
    expect([200, 201]).toContain(response.status());
    const body = await response.json();
    expect(body.data.userName).toBe(userData.username);
  });

  test('[TC-API-13] @validation — Rejects Duplicate Username Creation with 422', async ({ request }) => {
    const response = await request.post('/web/index.php/api/v2/admin/users', {
      headers: cookieHeader,
      data: {
        username: 'Admin', // Existing username
        password: 'Password@123',
        status: true,
        userRoleId: 1,
        empNumber: 1,
      },
    });

    expect(response.status()).toBe(422);
  });

  test('[TC-API-14] @validation — User Filter by Role ID enforces DB Isolation', async ({ request }) => {
    const response = await request.get('/web/index.php/api/v2/admin/users?userRoleId=1', {
      headers: cookieHeader,
    });

    expect(response.status()).toBe(200);
    const body = await response.json();

    for (const user of body.data) {
      expect(user.userRole.id).toBe(1);
    }
  });

  test('[TC-API-16] @validation — Missing Mandatory Username and Password Rejects with 422', async ({ request }) => {
    const response = await request.post('/web/index.php/api/v2/admin/users', {
      headers: cookieHeader,
      data: {
        username: '',
        password: '',
        status: true,
        userRoleId: 1,
        empNumber: null,
      },
    });

    expect(response.status()).toBe(422);
  });
});
