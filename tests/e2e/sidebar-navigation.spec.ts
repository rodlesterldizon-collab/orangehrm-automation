import { test, expect } from '../../fixtures/page-objects.fixture.js';

test.describe('Sidebar Navigation & Full Module Health Matrix Suite', () => {

  test('[TC-NAV-01] @p2 @navigation @admin — Navigate to Admin via Sidebar', async ({ dashboardPage, page }) => {
    await dashboardPage.sidebar.ensureVisible();
    await expect(dashboardPage.sidebar.adminMenuItem).toBeVisible();
    await dashboardPage.sidebar.adminMenuItem.click();
    await expect(page).toHaveURL(/.*\/admin\/viewSystemUsers/);
    await expect(dashboardPage.navbar.titleHeader).toContainText('Admin');
  });

  test('[TC-NAV-02] @p2 @navigation @pim — Navigate to PIM via Sidebar', async ({ dashboardPage, page }) => {
    await dashboardPage.sidebar.ensureVisible();
    await expect(dashboardPage.sidebar.pimMenuItem).toBeVisible();
    await dashboardPage.sidebar.pimMenuItem.click();
    await expect(page).toHaveURL(/.*\/pim\/viewEmployeeList/);
    await expect(dashboardPage.navbar.titleHeader).toContainText('PIM');
  });

  test('[TC-NAV-03] @p2 @navigation @leave — Navigate to Leave via Sidebar', async ({ dashboardPage, page }) => {
    await dashboardPage.sidebar.ensureVisible();
    await expect(dashboardPage.sidebar.leaveMenuItem).toBeVisible();
    await dashboardPage.sidebar.leaveMenuItem.click();
    await expect(page).toHaveURL(/.*\/leave\/viewLeaveList/);
    await expect(dashboardPage.navbar.titleHeader).toContainText('Leave');
  });

  test('[TC-NAV-04] @p2 @navigation @time — Navigate to Time via Sidebar', async ({ dashboardPage, page }) => {
    await dashboardPage.sidebar.ensureVisible();
    await expect(dashboardPage.sidebar.timeMenuItem).toBeVisible();
    await dashboardPage.sidebar.timeMenuItem.click();
    await expect(page).toHaveURL(/.*\/time\//);
    await expect(dashboardPage.navbar.titleHeader).toContainText(/Time/i);
  });

  test('[TC-NAV-05] @p2 @navigation @recruitment — Navigate to Recruitment via Sidebar', async ({ dashboardPage, page }) => {
    await dashboardPage.sidebar.ensureVisible();
    await expect(dashboardPage.sidebar.recruitmentMenuItem).toBeVisible();
    await dashboardPage.sidebar.recruitmentMenuItem.click();
    await expect(page).toHaveURL(/.*\/recruitment\/viewCandidates/);
    await expect(dashboardPage.navbar.titleHeader).toContainText('Recruitment');
  });

  test('[TC-NAV-06] @p2 @navigation @myinfo — Navigate to My Info via Sidebar', async ({ dashboardPage, page }) => {
    await dashboardPage.sidebar.ensureVisible();
    await expect(dashboardPage.sidebar.myInfoMenuItem).toBeVisible();
    await dashboardPage.sidebar.myInfoMenuItem.click();
    await expect(page).toHaveURL(/.*\/pim\/viewPersonalDetails/);
    await expect(dashboardPage.navbar.titleHeader).toContainText(/PIM|Personal Details/i);
  });

  test('[TC-NAV-07] @p2 @navigation @performance — Navigate to Performance via Sidebar', async ({ dashboardPage, page }) => {
    await dashboardPage.sidebar.ensureVisible();
    await expect(dashboardPage.sidebar.performanceMenuItem).toBeVisible();
    await dashboardPage.sidebar.performanceMenuItem.click();
    await expect(page).toHaveURL(/.*\/performance\//);
    await expect(dashboardPage.navbar.titleHeader).toContainText('Performance');
  });

  test('[TC-NAV-08] @p2 @navigation @dashboard — Navigate to Dashboard via Sidebar', async ({ dashboardPage, page }) => {
    await dashboardPage.sidebar.ensureVisible();
    await expect(dashboardPage.sidebar.dashboardMenuItem).toBeVisible();
    await dashboardPage.sidebar.dashboardMenuItem.click();
    await expect(page).toHaveURL(/.*\/dashboard\/index/);
    await expect(dashboardPage.navbar.titleHeader).toContainText('Dashboard');
  });

  test('[TC-NAV-09] @p2 @navigation @directory — Navigate to Directory via Sidebar', async ({ dashboardPage, page }) => {
    await dashboardPage.sidebar.ensureVisible();
    await expect(dashboardPage.sidebar.directoryMenuItem).toBeVisible();
    await dashboardPage.sidebar.directoryMenuItem.click();
    await expect(page).toHaveURL(/.*\/directory\/viewDirectory/);
    await expect(dashboardPage.navbar.titleHeader).toContainText('Directory');
  });

  test('[TC-NAV-10] @p2 @navigation @maintenance — Navigate to Maintenance via Sidebar', async ({ dashboardPage, maintenancePage, page }) => {
    await dashboardPage.sidebar.ensureVisible();
    await expect(dashboardPage.sidebar.maintenanceMenuItem).toBeVisible();
    await dashboardPage.sidebar.maintenanceMenuItem.click();
    await expect(page).toHaveURL(/.*\/maintenance\//);
    await expect(maintenancePage.adminAccessHeading).toBeVisible();

    await maintenancePage.confirmAdministratorAccess();
    await expect(maintenancePage.navbar.titleHeader).toContainText('Maintenance');
  });

  test('[TC-NAV-11] @p2 @navigation @claim — Navigate to Claim via Sidebar', async ({ dashboardPage, page }) => {
    await dashboardPage.sidebar.ensureVisible();
    await expect(dashboardPage.sidebar.claimMenuItem).toBeVisible();
    await dashboardPage.sidebar.claimMenuItem.click();
    await expect(page).toHaveURL(/.*\/claim\//);
    await expect(dashboardPage.navbar.titleHeader).toContainText('Claim');
  });

  test.skip('[TC-NAV-12] @p2 @navigation @buzz — Navigate to Buzz via Sidebar', async ({ dashboardPage, page }, testInfo) => {
    testInfo.annotations.push({
      type: 'issue',
      description: 'The Buzz module in the sidenav has been removed on October 4, 2026.',
    });
    await dashboardPage.sidebar.ensureVisible();
    await expect(dashboardPage.sidebar.buzzMenuItem).toBeVisible();
    await dashboardPage.sidebar.buzzMenuItem.click();
    await expect(page).toHaveURL(/.*\/buzz\/viewBuzz/);
    await expect(dashboardPage.navbar.titleHeader).toContainText('Buzz');
  });
});
