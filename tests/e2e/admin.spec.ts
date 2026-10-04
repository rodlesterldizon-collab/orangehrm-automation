import { test, expect } from '../../fixtures/page-objects.fixture.js';
import { generateUserData } from '../../utils/test-data.js';

test.describe('Admin User Role & Provisioning Suite', () => {
  test('[TC-UI-15] @smoke @p0 @admin — System Users Table Column Verification', async ({ adminPage }) => {
    // 1. Assert System Users headers are displayed properly (SS-02)
    await expect(adminPage.tableHeadings).toBeVisible();
    await expect(adminPage.tableHeadings).toContainText('Username');
    await expect(adminPage.tableHeadings).toContainText('User Role');
    await expect(adminPage.tableHeadings).toContainText('Employee Name');
    await expect(adminPage.tableHeadings).toContainText('Status');
    await expect(adminPage.tableHeadings).toContainText('Actions');
    await expect(adminPage.recordsFoundLabel).toBeVisible();
  });

  test('[TC-UI-16] @sanity @p1 @admin — Create New System User (Admin Role)', async ({ adminPage, page }) => {
    const userData = generateUserData('Admin');

    // 1. Open Add User form
    await adminPage.addUserButton.click();
    await adminPage.saveUserButton.waitFor({ state: 'visible', timeout: 10000 });

    // 2. Select Role
    await adminPage.userRoleSelect.click();
    await page.getByRole('option', { name: userData.role }).click();

    // 3. Type Employee Name autocomplete and select genuine non-loading option
    await adminPage.employeeNameAutocomplete.fill('a');
    await adminPage.autocompleteDropdown.waitFor({ state: 'visible', timeout: 6000 });
    const validOption = adminPage.autocompleteDropdown
      .locator('.oxd-autocomplete-option')
      .filter({ hasNotText: 'Searching' })
      .first();
    await validOption.waitFor({ state: 'visible', timeout: 8000 });
    await validOption.click();

    // 4. Select Status
    await adminPage.statusSelect.click();
    await page.getByRole('option', { name: userData.status }).click();

    // 5. Enter Username & Password
    await adminPage.sidebar.sidebarToggle.click();
    await expect(adminPage.sidebar.container).toHaveClass(/toggled/);
    await adminPage.usernameInput.fill(userData.username);
    await adminPage.passwordInput.fill(userData.password);
    await adminPage.confirmPasswordInput.fill(userData.password);

    // 6. Submit form
    await adminPage.saveUserButton.click();

    // 7. Assert success toast appears
    await expect(adminPage.toast).toBeVisible();
    await expect(adminPage.toast).toContainText('Successfully Saved');
  });

  test('[TC-UI-18] @validation @p1 @security @admin — Duplicate Username Rejection', async ({ adminPage }) => {
    // 1. Open Add User form
    await adminPage.addUserButton.click();
    await adminPage.saveUserButton.waitFor({ state: 'visible', timeout: 10000 });

    // 2. Type existing username "Admin" and trigger blur
    await adminPage.usernameInput.fill('Admin');
    await adminPage.page.keyboard.press('Tab');

    // 3. Assert collision validation error appears
    await expect(adminPage.alreadyExistsError).toBeVisible();
  });

  test('[TC-UI-19] @sanity @p1 @admin — Filter Users by Role (Admin)', async ({ adminPage, page }) => {
    // 1. Apply filter by User Role "Admin"
    await adminPage.searchUserRoleDropdown.click();
    await page.getByRole('option', { name: 'Admin' }).click();

    const searchResponsePromise = page.waitForResponse(
      (res) =>
        res.url().includes('/api/v2/admin/users') &&
        res.url().includes('userRoleId') &&
        res.request().method() === 'GET' &&
        res.status() === 200,
      { timeout: 15000 }
    );

    await adminPage.searchButton.click();
    const searchResponse = await searchResponsePromise;
    const payload = await searchResponse.json();

    // Verify API returns admin users and total > 0
    expect(payload.meta.total).toBeGreaterThan(0);
    expect(
      payload.data.every(
        (user: { userRole?: { name?: string; displayName?: string } }) =>
          user.userRole?.name === 'Admin' || user.userRole?.displayName === 'Admin'
      )
    ).toBe(true);

    // 2. Wait for loading spinner to clear so the grid settles
    await adminPage.waitForSpinner();

    // 3. Web-first assertion: wait for table rows to match the exact API result count
    await expect(adminPage.tableRows).toHaveCount(payload.data.length, { timeout: 15000 });
    await expect(adminPage.recordsFoundLabel).toContainText(`(${payload.meta.total}) Records Found`);

    // 4. Assert all rendered rows have "Admin" role
    for (let i = 0; i < payload.data.length; i++) {
      await expect(adminPage.userRoleCells.nth(i)).toHaveText('Admin');
    }
  });
});
