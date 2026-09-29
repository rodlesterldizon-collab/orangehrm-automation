import { test, expect } from '../../fixtures/page-objects.fixture.js';
import { getAdminCredentials } from '../../utils/helpers.js';

test.describe('Authentication & Session Management Suite', () => {
  const creds = getAdminCredentials();

  test('[TC-UI-01] @smoke @sanity @tablet @mobile — Valid Administrator Login & Responsive Header', async ({ loginPage, page }) => {
    // 1. Enter valid credentials and submit
    await loginPage.login(creds.username, creds.password);

    // 2. Assert redirect to dashboard URL and header presence
    await expect(page).toHaveURL(/.*\/dashboard\/index/);
    await expect(page.locator('.oxd-topbar-header-breadcrumb')).toContainText('Dashboard');
    await expect(loginPage.navbar.userDropdown).toBeVisible();
  });

  test('[TC-UI-02] @smoke @security @tablet @mobile — Invalid Password Rejection Banner', async ({ loginPage, page }) => {
    // 1. Attempt login with incorrect password
    await loginPage.login(creds.username, 'InvalidPassword999!');

    // 2. Assert rejection banner is visible with expected error message
    await expect(loginPage.errorAlert).toBeVisible();
    await expect(loginPage.errorAlertText).toContainText('Invalid credentials');
    await expect(page).toHaveURL(/.*\/auth\/login/);
  });

  test('[TC-UI-03] @regression — Blank Input Field Validation Errors', async ({ loginPage }) => {
    // 1. Submit with empty inputs
    await loginPage.login('', '');

    // 2. Assert inline required validation messages under fields
    await expect(loginPage.requiredErrorLabels.first()).toBeVisible();
    await expect(loginPage.requiredErrorLabels.first()).toHaveText('Required');
  });

  test('[TC-UI-04] @sanity @tablet @mobile — User Logout via Header Dropdown', async ({ dashboardPage, page }) => {
    // 1. Use the pre-authenticated dashboard fixture, open profile menu and logout
    await dashboardPage.navbar.logout();

    // 2. Assert redirection to login screen
    await expect(page).toHaveURL(/.*\/auth\/login/);
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
  });
});
