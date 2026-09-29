import { test, expect } from '../../fixtures/page-objects.fixture.js';
import { generateEmployeeData } from '../../utils/test-data.js';

test.describe('PIM Employee Lifecycle & Management Suite', () => {
  test('[TC-UI-09] @smoke @sanity — Add Employee with Auto-Generated ID', async ({ pimPage, page }) => {
    const employeeData = generateEmployeeData();

    // 1. Navigate to Add Employee form (SS-04)
    await pimPage.navigateToAdd();

    // 2. Fill mandatory names keeping auto-generated employee ID
    await pimPage.fillAddEmployeeForm(employeeData, false);
    await pimPage.saveEmployee();

    // 3. Assert success toast notification and redirection to profile view
    await pimPage.waitForToast();
    await expect(pimPage.toast).toContainText('Successfully Saved');
    await expect(page).toHaveURL(/.*\/pim\/viewPersonalDetails\/empNumber\/\d+/);
  });

  test('[TC-UI-10] @sanity — Add Employee with Custom Unique ID', async ({ pimPage, page }) => {
    const employeeData = generateEmployeeData();

    // 1. Navigate to Add Employee form
    await pimPage.navigateToAdd();

    // 2. Fill names and replace auto ID with custom alphanumeric ID
    await pimPage.fillAddEmployeeForm(employeeData, true);
    await pimPage.saveEmployee();

    // 3. Assert entity persistence with custom ID
    await pimPage.waitForToast();
    await expect(pimPage.toast).toContainText('Successfully Saved');
    await expect(page).toHaveURL(/.*\/pim\/viewPersonalDetails/);
  });

  test('[TC-UI-11] @regression — Mandatory Name Validation Flags', async ({ pimPage }) => {
    // 1. Navigate to Add Employee form
    await pimPage.navigateToAdd();

    // 2. Click Save without entering mandatory first/last names
    await pimPage.saveEmployee();

    // 3. Assert input fields render red required error messages
    const requiredLabels = pimPage.page.locator('.oxd-input-field-error-message');
    await expect(requiredLabels.first()).toBeVisible();
    await expect(requiredLabels.first()).toHaveText('Required');
  });

  test('[TC-UI-12] @sanity — Search Employee by Name Autocomplete Hint', async ({ pimPage, request }) => {
    // Fast API precondition seeding to guarantee target employee exists
    const employeeData = generateEmployeeData();
    const baseUrl = process.env.PLAYWRIGHT_BASE_URL || 'https://opensource-demo.orangehrmlive.com';
    await request.post(`${baseUrl}/web/index.php/api/v2/pim/employees`, {
      data: {
        firstName: employeeData.firstName,
        middleName: '',
        lastName: employeeData.lastName,
        employeeId: employeeData.employeeId,
      },
    });

    // 1. Search in UI using the seeded employee name
    await pimPage.navigateToList();
    await pimPage.searchByName(employeeData.firstName);

    // 2. Assert table filters down and contains employee row
    await expect(pimPage.table).toContainText(employeeData.firstName);
    await expect(pimPage.table).toContainText(employeeData.lastName);
  });

  test('[TC-UI-14] @regression — Filter Reset Restores Original Records Count', async ({ pimPage }) => {
    await pimPage.navigateToList();

    // 1. Get initial total count text, e.g. "(172) Records Found"
    const initialCountText = await pimPage.recordsFoundLabel.textContent();

    // 2. Perform a search filter to reduce count
    await pimPage.searchNameInput.fill('NonExistentNameXYZ999');
    await pimPage.searchButton.click();

    // 3. Click Reset
    await pimPage.resetSearch();

    // 4. Assert count label restores to initial state
    await expect(pimPage.recordsFoundLabel).toHaveText(initialCountText || '');
  });
});
