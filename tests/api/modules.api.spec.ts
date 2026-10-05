import { test, expect } from '@playwright/test';
import { getAuthCookie } from '../../utils/helpers.js';

test.describe('API Module Endpoints & Sidebar Health Matrix Suite', () => {
  let cookieHeader: { Cookie: string };

  test.beforeEach(async ({ request }) => {
    const authCookie = await getAuthCookie(request);
    cookieHeader = { Cookie: `orangehrm=${authCookie}` };
  });

  test('[TC-API-27] @sanity — Claim Requests Default Search Contract', async ({ request }) => {
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
      description: 'The Buzz module in the sidenav was deprecated/removed.',
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
    // Verify specific Maintenance form elements exist in HTML markup
    expect(html).toMatch(/purgeEmployee|oxd-form|auth-admin-access/i);
  });

  test('[TC-API-30] @smoke — Sidebar Modules Navigation Health Matrix (Active Core Endpoints)', async ({ request }) => {
    const sidebarEndpoints = [
      { name: 'Admin', path: '/web/index.php/admin/viewSystemUsers' },
      { name: 'PIM', path: '/web/index.php/pim/viewEmployeeList' },
      { name: 'Leave', path: '/web/index.php/leave/viewLeaveList' },
      { name: 'Time', path: '/web/index.php/time/viewEmployeeTimesheet' },
      { name: 'Recruitment', path: '/web/index.php/recruitment/viewCandidates' },
      { name: 'My Info', path: '/web/index.php/pim/viewMyDetails' }, // Replaced hardcoded empNumber/7 with dynamic route
      { name: 'Performance', path: '/web/index.php/performance/searchEvaluatePerformanceReview' },
      { name: 'Dashboard', path: '/web/index.php/dashboard/index' },
      { name: 'Directory', path: '/web/index.php/directory/viewDirectory' },
      { name: 'Maintenance', path: '/web/index.php/maintenance/purgeEmployee' },
      { name: 'Claim', path: '/web/index.php/claim/viewAssignClaim' },
    ];

    // Execute health checks concurrently for faster execution
    const results = await Promise.all(
      sidebarEndpoints.map(async (endpoint) => {
        const res = await request.get(endpoint.path, { headers: cookieHeader });
        return { ...endpoint, status: res.status() };
      })
    );

    for (const result of results) {
      expect(result.status, `Endpoint [${result.name}] at ${result.path} failed to load`).toBe(200);
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
