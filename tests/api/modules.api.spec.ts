import { test, expect } from '@playwright/test';
import { getAuthCookie } from '../../utils/helpers.js';

test.describe('API Module Endpoints & Sidebar Health Matrix Suite', () => {
  let cookieHeader: { Cookie: string };

  test.beforeEach(async ({ request }) => {
    const authCookie = await getAuthCookie(request);
    cookieHeader = { Cookie: `orangehrm=${authCookie}` };
  });

  test('[TC-API-27] @sanity — Claim Requests Default Search Contract', async ({ request }) => {
    // Default search with no extra filters applied
    const response = await request.get('/web/index.php/api/v2/claim/requests?limit=50&offset=0', {
      headers: cookieHeader,
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('data');
    expect(Array.isArray(body.data)).toBe(true);
  });

  test.skip('[TC-API-28] @sanity — Buzz Newsfeed API Stream Contract', async ({ request }, testInfo) => {
    testInfo.annotations.push({
      type: 'issue',
      description: 'The Buzz module in the sidenav has been removed on October 4, 2026.',
    });
    const response = await request.get('/web/index.php/api/v2/buzz/feed?limit=10&offset=0', {
      headers: cookieHeader,
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('data');
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('[TC-API-29] @sanity — Maintenance Purge Employee Page State Check', async ({ request }) => {
    const response = await request.get('/web/index.php/maintenance/purgeEmployee', {
      headers: cookieHeader,
    });

    expect(response.status()).toBe(200);
    const html = await response.text();
    expect(html).toContain('orangehrm');
  });

  test('[TC-API-30] @smoke — Sidebar Modules Navigation Health Matrix (Active Core Endpoints)', async ({ request }) => {
    const sidebarEndpoints = [
      { name: 'Admin', path: '/web/index.php/admin/viewSystemUsers' },
      { name: 'PIM', path: '/web/index.php/pim/viewEmployeeList' },
      { name: 'Leave', path: '/web/index.php/leave/viewLeaveList' },
      { name: 'Time', path: '/web/index.php/time/viewEmployeeTimesheet' },
      { name: 'Recruitment', path: '/web/index.php/recruitment/viewCandidates' },
      { name: 'My Info', path: '/web/index.php/pim/viewPersonalDetails/empNumber/7' },
      { name: 'Performance', path: '/web/index.php/performance/searchEvaluatePerformanceReview' },
      { name: 'Dashboard', path: '/web/index.php/dashboard/index' },
      { name: 'Directory', path: '/web/index.php/directory/viewDirectory' },
      { name: 'Maintenance', path: '/web/index.php/maintenance/purgeEmployee' },
      { name: 'Claim', path: '/web/index.php/claim/viewAssignClaim' },
    ];

    for (const endpoint of sidebarEndpoints) {
      const res = await request.get(endpoint.path, {
        headers: cookieHeader,
      });

      expect(res.status(), `Endpoint [${endpoint.name}] at ${endpoint.path} failed to load`).toBe(200);
    }
  });

  test('[TC-API-32] @smoke @sanity — User Session & Dashboard Employees Action Summary Contract', async ({ request }) => {
    const response = await request.get('/web/index.php/api/v2/dashboard/employees/action-summary', {
      headers: cookieHeader,
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('data');
    expect(typeof body.data).toBe('object');
  });
});
