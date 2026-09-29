import { test, expect } from '../../fixtures/page-objects.fixture.js';

test.describe('Responsive Viewport & Mobile Navigation Suite', () => {
  test('[TC-UI-25] @regression @tablet @mobile — Responsive Topbar & Collapsible Hamburger Navigation Bar', async ({
    dashboardPage,
    page,
  }) => {
    // 1. Verify topbar header is present
    await expect(dashboardPage.navbar.container).toBeVisible();
    await expect(dashboardPage.navbar.breadcrumbHeader).toBeVisible();

    // 2. Check if running in a responsive viewport (tablet/mobile where hamburger button exists)
    const hamburger = dashboardPage.navbar.hamburgerButton;
    const isResponsiveViewport = await hamburger.isVisible().catch(() => false);

    if (isResponsiveViewport) {
      // Validate hamburger button is interactive
      await expect(hamburger).toBeEnabled();

      // Click hamburger to open sidebar drawer
      await dashboardPage.navbar.toggleHamburger();
      await expect(dashboardPage.sidebar.container).toBeVisible();

      // Verify key menu items are rendered inside drawer
      await expect(dashboardPage.sidebar.getMenuItem('Admin')).toBeVisible();
      await expect(dashboardPage.sidebar.getMenuItem('PIM')).toBeVisible();
      await expect(dashboardPage.sidebar.getMenuItem('Directory')).toBeVisible();

      // Click hamburger again to collapse drawer or navigate
      await dashboardPage.sidebar.navigateTo('PIM');
      await expect(page).toHaveURL(/.*\/pim\/viewEmployeeList/);
    } else {
      // Desktop viewport: verify sidebar is expanded by default
      await expect(dashboardPage.sidebar.container).toBeVisible();
      await expect(dashboardPage.sidebar.getMenuItem('PIM')).toBeVisible();
      await dashboardPage.sidebar.navigateTo('PIM');
      await expect(page).toHaveURL(/.*\/pim\/viewEmployeeList/);
    }
  });

  test('[TC-UI-26] @regression @tablet @mobile — Dashboard Responsive Layout & Quick Launch Adaptability', async ({
    dashboardPage,
    page,
  }) => {
    // 1. Verify dashboard widgets container renders without horizontal overflow
    await expect(dashboardPage.dashboardHeader).toBeVisible();
    await expect(dashboardPage.quickLaunchWidget).toBeVisible();

    // 2. Verify viewport width does not cause awkward document horizontal scroll
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth + 20;
    });
    expect(hasHorizontalOverflow).toBe(false);

    // 3. User profile menu is accessible across viewports
    await expect(dashboardPage.navbar.userDropdown).toBeVisible();
    await dashboardPage.navbar.openUserDropdown();
    await expect(dashboardPage.navbar.logoutLink).toBeVisible();
  });

  test('[TC-UI-27] @regression @tablet @mobile — Directory Card Grid Responsive Viewport Adaptation', async ({
    directoryPage,
    page,
  }) => {
    // 1. Navigate to directory and verify header
    await directoryPage.goto();
    await expect(page).toHaveURL(/.*\/directory\/viewDirectory/);

    // 2. Verify search form adapts to viewport without clipping
    await expect(directoryPage.searchButton).toBeVisible();
    await expect(directoryPage.resetButton).toBeVisible();

    // 3. Verify cards grid or container is visible
    await expect(directoryPage.cardsGrid).toBeVisible();

    // 4. Ensure no horizontal page clipping on mobile/tablet
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth + 20;
    });
    expect(hasHorizontalOverflow).toBe(false);
  });
});
