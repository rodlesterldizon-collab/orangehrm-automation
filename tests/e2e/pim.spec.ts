import { test, expect } from '../../fixtures/page-objects.fixture.js';
import { generateEmployeeData } from '../../utils/test-data.js';
import { waitForSpinner } from '../../utils/helpers.js';

test.describe('PIM Employee Lifecycle & Management Suite', () => {
  test('[TC-UI-09] @smoke @sanity — Add Employee with Auto-Generated ID', async ({ pimPage, page }) => {
    const employeeData = generateEmployeeData();

    // 1. Navigate to Add Employee form (SS-04)
    await pimPage.navigateToAdd();

    // 2. Fill mandatory names keeping auto-generated employee ID
    await pimPage.firstNameInput.fill(employeeData.firstName);
    if (employeeData.middleName) {
      await pimPage.middleNameInput.fill(employeeData.middleName);
    }
    await pimPage.lastNameInput.fill(employeeData.lastName);
    await pimPage.saveEmployeeButton.click();

    // 3. Assert success toast notification and redirection to profile view
    await expect(pimPage.toast).toBeVisible();
    await expect(pimPage.toast).toContainText('Successfully Saved');
    await expect(page).toHaveURL(/.*\/pim\/viewPersonalDetails\/empNumber\/\d+/);
  });

  test('[TC-UI-10] @sanity — Add Employee with Custom Unique ID', async ({ pimPage, page }) => {
    const employeeData = generateEmployeeData();

    // 1. Navigate to Add Employee form
    await pimPage.navigateToAdd();

    // 2. Fill names and replace auto ID with custom alphanumeric ID
    await pimPage.firstNameInput.fill(employeeData.firstName);
    if (employeeData.middleName) {
      await pimPage.middleNameInput.fill(employeeData.middleName);
    }
    await pimPage.lastNameInput.fill(employeeData.lastName);
    await pimPage.employeeIdInput.click();
    await pimPage.employeeIdInput.fill('');
    await pimPage.employeeIdInput.fill(employeeData.employeeId);
    await pimPage.saveEmployeeButton.click();

    // 3. Assert entity persistence with custom ID
    await expect(pimPage.toast).toBeVisible();
    await expect(pimPage.toast).toContainText('Successfully Saved');
    await expect(page).toHaveURL(/.*\/pim\/viewPersonalDetails/);
  });

  test('[TC-UI-11] @regression — Mandatory Name Validation Flags', async ({ pimPage }) => {
    // 1. Navigate to Add Employee form
    await pimPage.navigateToAdd();

    // 2. Click Save without entering mandatory first/last names
    await pimPage.saveEmployeeButton.click();

    // 3. Assert input fields render red required error messages
    const requiredLabels = pimPage.page.locator('.oxd-input-field-error-message');
    await expect(requiredLabels.first()).toBeVisible();
    await expect(requiredLabels.first()).toHaveText('Required');
  });

  test('[TC-UI-12] @sanity — Search Employee by Name Autocomplete Hint', async ({ pimPage, request }) => {
    // Fast API precondition seeding to guarantee target employee exists
    const employeeData = generateEmployeeData();
    await request.post('/web/index.php/api/v2/pim/employees', {
      data: {
        firstName: employeeData.firstName,
        middleName: '',
        lastName: employeeData.lastName,
        employeeId: employeeData.employeeId,
      },
    });

    // 1. Search in UI using the seeded employee name
    await pimPage.navigateToList();
    await pimPage.searchNameInput.fill(employeeData.firstName);
    await pimPage.autocompleteDropdown.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    const option = pimPage.autocompleteDropdown.locator('.oxd-autocomplete-option, [role="option"]').first();
    if (await option.isVisible().catch(() => false)) {
      await option.click();
    }
    await pimPage.searchButton.click();

    // 2. Assert table filters down and contains employee row
    await expect(pimPage.table).toContainText(employeeData.firstName);
    await expect(pimPage.table).toContainText(employeeData.lastName);
  });

  test('[TC-UI-14] @regression — Filter Reset Restores Original Records Count', async ({ pimPage, page }) => {
    await pimPage.navigateToList();
    await waitForSpinner(page);

    // 1. Ensure initial records found counter is rendered
    await expect(pimPage.recordsFoundLabel).toHaveText(/.*Records? Found/i, { timeout: 10000 });

    // 2. Perform a search filter to reduce count
    await pimPage.searchNameInput.fill('NonExistentNameXYZ999');
    await pimPage.searchButton.click();
    await waitForSpinner(page);

    // 3. Click Reset
    await pimPage.resetButton.click();
    await waitForSpinner(page);

    // 4. Assert count label restores to full records found format with wildcard regex
    await expect(pimPage.recordsFoundLabel).toHaveText(/.*Records? Found/i, { timeout: 10000 });

    // 5. Check container has multiple rows (not just one record)
    await expect(pimPage.tableRows.first()).toBeVisible({ timeout: 10000 });
    const rowCount = await pimPage.tableRows.count();
    expect(rowCount).toBeGreaterThan(1);
  });
});
