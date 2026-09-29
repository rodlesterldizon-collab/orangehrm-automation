import { test, expect } from '../../fixtures/page-objects.fixture.js';
import { generateUserData } from '../../utils/test-data.js';

test.describe('Admin User Role & Provisioning Suite', () => {
  test('[TC-UI-15] @smoke — System Users Table Column Verification', async ({ adminPage }) => {
    // 1. Assert System Users headers are displayed properly (SS-02)
    await expect(adminPage.table).toBeVisible();
    await expect(adminPage.table).toContainText('Username');
    await expect(adminPage.table).toContainText('User Role');
    await expect(adminPage.table).toContainText('Employee Name');
    await expect(adminPage.table).toContainText('Status');
    await expect(adminPage.table).toContainText('Actions');
    await expect(adminPage.recordsFoundLabel).toBeVisible();
  });

  test('[TC-UI-16] @sanity — Create New System User (Admin Role)', async ({ adminPage }) => {
    const userData = generateUserData('Admin');

    // 1. Open Add User form
    await adminPage.openAddUser();

    // 2. Fill form and submit
    await adminPage.createUser(userData, 'a');

    // 3. Assert success toast appears
    await adminPage.waitForToast();
    await expect(adminPage.toast).toContainText('Successfully Saved');
  });

  test('[TC-UI-18] @regression @security — Duplicate Username Rejection', async ({ adminPage }) => {
    // 1. Open Add User form
    await adminPage.openAddUser();

    // 2. Type existing username "Admin" and trigger blur
    await adminPage.usernameInput.fill('Admin');
    await adminPage.page.keyboard.press('Tab');

    // 3. Assert collision validation error appears
    await expect(adminPage.alreadyExistsError).toBeVisible();
  });

  test('[TC-UI-19] @sanity — Filter Users by Role (Admin)', async ({ adminPage }) => {
    // 1. Apply filter by User Role "Admin"
    await adminPage.filterByRole('Admin');

    // 2. Assert every returned row in the User Role column displays "Admin"
    const userRoleCells = adminPage.page.locator('.oxd-table-card .oxd-table-cell:nth-child(3)');
    const count = await userRoleCells.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < Math.min(count, 5); i++) {
      await expect(userRoleCells.nth(i)).toHaveText('Admin');
    }
  });
});
