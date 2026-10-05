import { test, expect, type APIRequestContext } from '@playwright/test';
import { getAuthCookie } from '../../utils/helpers.js';
import { generateUserData } from '../../utils/test-data.js';

test.describe('API Admin User Role & RBAC Contract Suite', () => {
  let cookieHeader: { Cookie: string };

  test.beforeEach(async ({ request }) => {
    const authCookie = await getAuthCookie(request);
    cookieHeader = { Cookie: `orangehrm=${authCookie}` };
  });

  // Helper function to fetch dynamic empNumber only when required for user creation
  async function fetchValidEmpNumber(request: APIRequestContext): Promise<number> {
    const empRes = await request.get('/web/index.php/api/v2/pim/employees?limit=1', {
      headers: cookieHeader,
    });
    const empBody = await empRes.json();
    const empNumber = empBody?.data?.[0]?.empNumber;
    if (!empNumber) throw new Error('No employees found in DB — empNumber required to create users');
    return empNumber;
  }

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
    const empNumber = await fetchValidEmpNumber(request);
    const userData = generateUserData('Admin');
    let createdUserId: number | null = null;

    try {
      const response = await request.post('/web/index.php/api/v2/admin/users', {
        headers: cookieHeader,
        data: {
          username: userData.username,
          password: userData.password,
          status: true,
          userRoleId: 1, // 1 = Admin
          empNumber,
        },
      });

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.data.userName).toBe(userData.username);
      createdUserId = body?.data?.id ?? null;
    } finally {
      // Teardown — always clean up created user to prevent stale data across runs
      if (createdUserId) {
        await request.delete('/web/index.php/api/v2/admin/users', {
          headers: cookieHeader,
          data: { ids: [createdUserId] },
        });
      }
    }
  });

  test('[TC-API-13] @validation — Rejects Duplicate Username Creation with 422', async ({ request }) => {
    const response = await request.post('/web/index.php/api/v2/admin/users', {
      headers: cookieHeader,
      data: {
        username: 'Admin', // Existing built-in username — always a duplicate
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
