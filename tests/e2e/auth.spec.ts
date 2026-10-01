import { test, expect } from '../../fixtures/page-objects.fixture.js';
import { getAdminCredentials } from '../../utils/helpers.js';

// Reset storageState for UI login flow tests
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Authentication & Session Management Suite', () => {
  const creds = getAdminCredentials();

  test('[TC-UI-01] @smoke @sanity @tablet @mobile @auth — Valid Administrator Login & Responsive Header', async ({ loginPage, page }) => {
    // 1. Enter valid credentials and submit
    await loginPage.usernameInput.fill(creds.username);
    await loginPage.passwordInput.fill(creds.password);
    await loginPage.loginButton.click();

    // 2. Assert redirect to dashboard URL and header presence
    await expect(page).toHaveURL(/.*\/dashboard\/index/);
    await expect(page.locator('.oxd-topbar-header-breadcrumb')).toContainText('Dashboard');
    await expect(loginPage.navbar.userDropdown).toBeVisible();
  });

  test('[TC-UI-02] @smoke @security @tablet @mobile @auth — Invalid Password Rejection Banner', async ({ loginPage, page }) => {
    // 1. Attempt login with incorrect password
    await loginPage.usernameInput.fill(creds.username);
    await loginPage.passwordInput.fill('InvalidPassword999!');
    await loginPage.loginButton.click();

    // 2. Assert rejection banner is visible with expected error message
    await expect(loginPage.errorAlert).toBeVisible();
    await expect(loginPage.errorAlertText).toContainText('Invalid credentials');
    await expect(page).toHaveURL(/.*\/auth\/login/);
  });

  test('[TC-UI-03] @validation @auth — Blank Input Field Validation Errors', async ({ loginPage }) => {
    // 1. Submit with empty inputs
    await loginPage.usernameInput.fill('');
    await loginPage.passwordInput.fill('');
    await loginPage.loginButton.click();

    // 2. Assert inline required validation messages under fields
    await expect(loginPage.requiredErrorLabels.first()).toBeVisible();
    await expect(loginPage.requiredErrorLabels.first()).toHaveText('Required');
  });

  test('[TC-UI-04] @sanity @tablet @mobile @auth — User Logout via Header Dropdown', async ({ dashboardPage, page }) => {
    // 1. Use the pre-authenticated dashboard fixture, open profile menu and logout
    await dashboardPage.navbar.userDropdown.click();
    await dashboardPage.navbar.logoutLink.click();

    // 2. Assert redirection to login screen
    await expect(page).toHaveURL(/.*\/auth\/login/);
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
  });
});
