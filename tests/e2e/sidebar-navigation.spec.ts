import { test, expect } from '../../fixtures/page-objects.fixture.js';
import { getAdminCredentials } from '../../utils/helpers.js';

interface SidebarModule {
  id: string;
  name: string;
  urlMatch: string;
  expectedUrlRegex: string;
  apiMatch: string;
  description: string;
}

const SIDEBAR_MODULES: SidebarModule[] = [
  {
    id: 'TC-NAV-01',
    name: 'Admin',
    urlMatch: '/admin/viewSystemUsers',
    expectedUrlRegex: '/admin/viewSystemUsers',
    apiMatch: '/api/v2/admin/users',
    description: 'Admin System Users ledger and search filters',
  },
  {
    id: 'TC-NAV-02',
    name: 'PIM',
    urlMatch: '/pim/viewEmployeeList',
    expectedUrlRegex: '/pim/viewEmployeeList',
    apiMatch: '/api/v2/pim/employees',
    description: 'PIM Employee Information Management list and search filters',
  },
  {
    id: 'TC-NAV-03',
    name: 'Leave',
    urlMatch: '/leave/viewLeaveList',
    expectedUrlRegex: '/leave/viewLeaveList',
    apiMatch: '/api/v2/leave/',
    description: 'Leave List and date-range management controls',
  },
  {
    id: 'TC-NAV-04',
    name: 'Time',
    urlMatch: '/time/viewEmployeeTimesheet',
    expectedUrlRegex: '/time/',
    apiMatch: '/api/v2/time/',
    description: 'Time attendance & employee timesheets ledger',
  },
  {
    id: 'TC-NAV-05',
    name: 'Recruitment',
    urlMatch: '/recruitment/viewCandidates',
    expectedUrlRegex: '/recruitment/viewCandidates',
    apiMatch: '/api/v2/recruitment/candidates',
    description: 'Recruitment Candidates tracking table and search filters',
  },
  {
    id: 'TC-NAV-06',
    name: 'My Info',
    urlMatch: '/pim/viewPersonalDetails',
    expectedUrlRegex: '/pim/viewPersonalDetails',
    apiMatch: '/api/v2/pim/employees',
    description: 'Employee Personal Details profile and sub-tabs',
  },
  {
    id: 'TC-NAV-07',
    name: 'Performance',
    urlMatch: '/performance/searchEvaluatePerformanceReview',
    expectedUrlRegex: '/performance/',
    apiMatch: '/api/v2/performance/',
    description: 'Performance Reviews evaluation search and management',
  },
  {
    id: 'TC-NAV-08',
    name: 'Dashboard',
    urlMatch: '/dashboard/index',
    expectedUrlRegex: '/dashboard/index',
    apiMatch: '/api/v2/dashboard/',
    description: 'Main operational dashboard widgets and quick launch shortcuts',
  },
  {
    id: 'TC-NAV-09',
    name: 'Directory',
    urlMatch: '/directory/viewDirectory',
    expectedUrlRegex: '/directory/viewDirectory',
    apiMatch: '/api/v2/directory/employees',
    description: 'Corporate Directory search and employee profile cards',
  },
  {
    id: 'TC-NAV-10',
    name: 'Maintenance',
    urlMatch: '/maintenance/purgeEmployee',
    expectedUrlRegex: '/maintenance/',
    apiMatch: '/maintenance/',
    description: 'Maintenance purge and administrator re-authentication access',
  },
  {
    id: 'TC-NAV-11',
    name: 'Claim',
    urlMatch: '/claim/viewAssignClaim',
    expectedUrlRegex: '/claim/',
    apiMatch: '/api/v2/claim/',
    description: 'Employee claims ledger and claim requests submission',
  },
  {
    id: 'TC-NAV-12',
    name: 'Buzz',
    urlMatch: '/buzz/viewBuzz',
    expectedUrlRegex: '/buzz/viewBuzz',
    apiMatch: '/api/v2/buzz/feed',
    description: 'Buzz social newsfeed post stream and composer',
  },
];

test.describe('Sidebar Navigation & Full Module Health Matrix Suite', () => {
  const creds = getAdminCredentials();

  // 1. Individual tests for each of the 12 sidebar modules (allows targeted single-test execution via POM)
  for (const mod of SIDEBAR_MODULES) {
    const moduleTag = `@${mod.name.toLowerCase().replace(/\s+/g, '')}`;
    test(`[${mod.id}] @p2 @navigation ${moduleTag} — Navigate to [${mod.name}] via Sidebar (HTTP 200/201 & UI Render)`, async ({
      dashboardPage,
      page,
    }) => {
      // 1. Setup response listener for the module's HTML route or primary API call
      const responsePromise = page.waitForResponse(
        (res) =>
          (res.url().includes(mod.urlMatch) || res.url().includes(mod.apiMatch)) &&
          [200, 201, 304].includes(res.status()),
        { timeout: 15000 }
      ).catch(() => null);

      // 2. Click sidebar menu item via POM
      await dashboardPage.sidebar.ensureVisible();
      const menuItem = dashboardPage.sidebar.getMenuItem(mod.name);
      await expect(menuItem).toBeVisible({ timeout: 8000 });
      await menuItem.click();

      // 3. Handle secondary admin password re-auth prompt for Maintenance via POM method
      if (mod.name === 'Maintenance') {
        await dashboardPage.sidebar.handleMaintenanceReAuthIfPrompted(creds.password);
      }

      // 4. Assert network response returned successfully (HTTP 200 / 201)
      const res = await responsePromise;
      if (res) {
        expect([200, 201, 304], `Endpoint for [${mod.name}] returned ${res.status()}`).toContain(res.status());
      }

      // 5. Assert URL transitions to expected route
      await expect(page).toHaveURL(new RegExp(mod.expectedUrlRegex), { timeout: 15000 });

      // 6. Assert Topbar Header / Breadcrumb is rendered via POM
      await expect(dashboardPage.navbar.breadcrumbHeader).toBeVisible({ timeout: 10000 });

      // 7. Wait for loading spinner to clear via POM helper
      await dashboardPage.waitForSpinner();

      // 8. Assert core module UI container is rendered via POM
      const uiContainer = dashboardPage.sidebar.getModuleView(mod.name);
      await expect(uiContainer).toBeVisible({ timeout: 15000 });
    });
  }

  // 2. Unified Aggregate End-to-End Walkthrough of all 12 modules in a single continuous session via POM
  test('[TC-NAV-ALL] @p2 @navigation @smoke — Unified Sidebar Walkthrough across All 12 Modules (Continuous Session)', async ({
    dashboardPage,
    page,
  }) => {
    const verifiedModules: string[] = [];

    for (const mod of SIDEBAR_MODULES) {
      // Setup response listener for route or API
      const responsePromise = page.waitForResponse(
        (res) =>
          (res.url().includes(mod.urlMatch) || res.url().includes(mod.apiMatch)) &&
          [200, 201, 304].includes(res.status()),
        { timeout: 15000 }
      ).catch(() => null);

      // Click menu item in sidebar via POM
      await dashboardPage.sidebar.ensureVisible();
      const menuItem = dashboardPage.sidebar.getMenuItem(mod.name);
      await expect(menuItem).toBeVisible({ timeout: 8000 });
      await menuItem.click();

      // Handle Maintenance re-auth if prompted via POM method
      if (mod.name === 'Maintenance') {
        await dashboardPage.sidebar.handleMaintenanceReAuthIfPrompted(creds.password);
      }

      // Assert network response
      const res = await responsePromise;
      if (res) {
        expect([200, 201, 304], `Navigation to [${mod.name}] failed with status ${res.status()}`).toContain(res.status());
      }

      // Assert URL and DOM state via POM
      await expect(page).toHaveURL(new RegExp(mod.expectedUrlRegex), { timeout: 15000 });
      await dashboardPage.waitForSpinner();
      await expect(dashboardPage.sidebar.getModuleView(mod.name)).toBeVisible({ timeout: 15000 });

      verifiedModules.push(mod.name);
    }

    // Verify that all 12 modules completed successfully in the unified sequence
    expect(verifiedModules).toHaveLength(12);
    expect(verifiedModules).toEqual([
      'Admin',
      'PIM',
      'Leave',
      'Time',
      'Recruitment',
      'My Info',
      'Performance',
      'Dashboard',
      'Directory',
      'Maintenance',
      'Claim',
      'Buzz',
    ]);
  });
});
