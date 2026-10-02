import { test, expect } from '../../fixtures/page-objects.fixture.js';

test.describe('Dashboard Operational Widgets & Quick Launch Suite', () => {
  test('[TC-UI-06] @smoke @sanity @p0 @dashboard — Dashboard Landing URL, Title & Main Widgets Grid', async ({
    dashboardPage,
    page,
  }) => {
    // 1. Assert landing URL is /dashboard/index
    await expect(page).toHaveURL(/.*\/dashboard\/index/);

    // 2. Assert Page Header display "Dashboard" via POM
    await expect(dashboardPage.navbar.titleHeader).toContainText('Dashboard');

    // 3. Verify core operational dashboard widgets are visible via POM
    await expect(dashboardPage.quickLaunchTitle).toBeVisible();
    await expect(dashboardPage.timeAtWorkTitle).toBeVisible();
    await expect(dashboardPage.myActionsWidget).toBeVisible();

    // 4. Assert total dashboard widget count (at least 4 cards rendered)
    const widgetCount = await dashboardPage.getWidgetCount();
    expect(widgetCount).toBeGreaterThanOrEqual(4);
  });

  test('[TC-UI-07] @sanity @p1 @dashboard @leave — Quick Launch Shortcut to Assign Leave Navigation', async ({
    dashboardPage,
    page,
  }) => {
    // 1. In Quick Launch widget, click "Assign Leave" via POM action
    await expect(dashboardPage.assignLeaveButton).toBeVisible();
    await dashboardPage.clickAssignLeave();

    // 2. Assert direct browser transition to /leave/assignLeave
    await expect(page).toHaveURL(/.*\/leave\/assignLeave/);
    await expect(dashboardPage.navbar.titleHeader).toContainText('Leave');
  });

  test('[TC-UI-08] @sanity @p1 @dashboard @time — Quick Launch Shortcut to Timesheets Navigation', async ({
    dashboardPage,
    page,
  }) => {
    // 1. Return to dashboard via POM navigation
    await dashboardPage.navigate();

    // 2. In Quick Launch widget, click "Timesheets" via POM action
    await expect(dashboardPage.timesheetsButton).toBeVisible();
    await dashboardPage.clickTimesheets();

    // 3. Assert transition to /time module
    await expect(page).toHaveURL(/.*\/time\//);
    await expect(dashboardPage.navbar.titleHeader).toContainText(/Time/i);
  });

  test('[TC-UI-36] @validation @p2 @dashboard — Time at Work Widget Attendance Punch Card State', async ({
    dashboardPage,
  }) => {
    // 1. Verify Time at Work widget <p> text and clock-fill <i> icon
    await expect(dashboardPage.timeAtWorkTitle).toContainText('Time at Work');
    await expect(dashboardPage.timeAtWorkIcon).toBeVisible();
  });

  test('[TC-UI-37] @validation @p2 @dashboard — My Actions Widget Pending Items Ledger', async ({
    dashboardPage,
  }) => {
    // 1. Verify My Actions widget <p> text and list <i> icon
    await expect(dashboardPage.myActionsTitle).toContainText('My Actions');
    await expect(dashboardPage.myActionsIcon).toBeVisible();
  });

  test('[TC-UI-38] @validation @p2 @dashboard — Employee Distribution Charts Presence', async ({
    dashboardPage,
  }) => {
    // 1. Verify Employee Distribution by Sub Unit widget card via POM
    await expect(dashboardPage.employeeDistributionSubUnitWidget).toBeVisible();
    await expect(dashboardPage.employeeDistributionSubUnitWidget).toContainText('Employee Distribution by Sub Unit');
  });

  test('[TC-UI-39] @sanity @p1 @dashboard @auth — Top Navigation Profile Dropdown Menu from Dashboard', async ({
    dashboardPage,
  }) => {
    // 1. Open user avatar menu in top-right corner via POM method
    await dashboardPage.navbar.openUserMenu();

    // 2. Menu panel opens with 4 items: About, Support, Change Password, Logout
    await expect(dashboardPage.navbar.aboutLink).toBeVisible();
    await expect(dashboardPage.navbar.supportLink).toBeVisible();
    await expect(dashboardPage.navbar.changePasswordLink).toBeVisible();
    await expect(dashboardPage.navbar.logoutLink).toBeVisible();
  });
});
