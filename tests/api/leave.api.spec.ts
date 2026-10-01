import { test, expect } from '@playwright/test';
import { getAuthCookie } from '../../utils/helpers.js';

test.describe('API Leave Management & Balance Reports Contract Suite', () => {
  let cookieHeader: { Cookie: string };

  test.beforeEach(async ({ request }) => {
    const authCookie = await getAuthCookie(request);
    cookieHeader = { Cookie: `orangehrm=${authCookie}` };
  });

  test('[TC-API-19] @sanity — Leave Balance Report Generation API Contract', async ({ request }) => {
    const response = await request.get(
      '/web/index.php/api/v2/leave/reports/data?limit=50&offset=0&fromDate=2026-01-01&toDate=2026-12-31&name=my_leave_entitlements_and_usage&_dateFormattingEnabled=true',
      { headers: cookieHeader }
    );

    expect(response.status()).toBe(200);
    const body = await response.json();

    expect(body).toHaveProperty('data');
    expect(body).toHaveProperty('meta');
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('[TC-API-20] @validation — Leave Balance Report Rejects Invalid Report Identifier with 422/404/400', async ({ request }) => {
    const response = await request.get(
      '/web/index.php/api/v2/leave/reports/data?limit=50&offset=0&fromDate=invalid-date&name=non_existent_report_definition',
      { headers: cookieHeader }
    );

    // Invalid report definition or malformed date parameters return 422, 404, or 400
    expect([400, 404, 422]).toContain(response.status());
  });

  test('[TC-API-21] @sanity — Leave Types List Contract for Leave Assignment', async ({ request }) => {
    const response = await request.get('/web/index.php/api/v2/leave/leave-types?limit=50&offset=0', {
      headers: cookieHeader,
    });

    expect(response.status()).toBe(200);
    const body = await response.json();

    expect(body.data).toBeDefined();
    expect(Array.isArray(body.data)).toBe(true);
  });
});
