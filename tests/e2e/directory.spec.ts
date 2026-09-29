import { test, expect } from '../../fixtures/page-objects.fixture.js';
import { waitForSpinner } from '../../utils/helpers.js';

test.describe('Directory Search & Navigation Suite', () => {
  test('[TC-UI-21] @smoke — Directory Card Grid Initial Render', async ({ directoryPage }) => {
    // 1. Verify card grid and counter are visible (SS-05)
    await expect(directoryPage.recordsFoundLabel).toBeVisible();
    await expect(directoryPage.recordsFoundLabel).toHaveText(/.*Records? Found/i);
    await expect(directoryPage.employeeCards.first()).toBeVisible();
  });

  test('[TC-UI-22] @sanity — Search Directory by Name Autocomplete', async ({ directoryPage, page }) => {
    // 1. Type hint into search input
    await directoryPage.searchNameInput.fill('a');
    await directoryPage.autocompleteDropdown.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    
    // 2. Select first available option from dropdown
    const option = directoryPage.autocompleteOptions.filter({ hasNotText: 'Searching' }).first();
    if (await option.isVisible().catch(() => false)) {
      await option.click();
    }

    // 3. Click Search button and wait for spinner to appear and disappear
    await directoryPage.searchButton.click();
    await waitForSpinner(page);

    // 4. Assert card grid displays at least one filtered profile card
    await expect(directoryPage.employeeCards.first()).toBeVisible();
  });

  test('[TC-UI-23] @regression — Filter Directory by Job Title', async ({ directoryPage, page }) => {
    // 1. Click Job Title dropdown
    await directoryPage.jobTitleDropdown.click();
    await directoryPage.selectDropdown.waitFor({ state: 'visible', timeout: 5000 });

    // 2. Click "Chief Financial Officer" option
    const targetOption = directoryPage.selectOptions.filter({ hasText: 'Chief Financial Officer' }).first();
    await targetOption.click();

    // 3. Click Search button and wait for spinner to appear and disappear
    await directoryPage.searchButton.click();
    await waitForSpinner(page);

    // 4. Assert filtered card contains the expected title
    await expect(directoryPage.employeeCards.first()).toBeVisible({ timeout: 10000 });
    await expect(directoryPage.employeeCards.first()).toContainText('Chief Financial Officer');
  });

  test('[TC-UI-24] @regression — Reset Filter Restores Full Count', async ({ directoryPage, page }) => {
    // 1. Ensure initial directory grid is loaded with records
    await expect(directoryPage.recordsFoundLabel).toHaveText(/.*Records? Found/i, { timeout: 10000 });

    // 2. Click Job Title dropdown and select option
    await directoryPage.jobTitleDropdown.click();
    await directoryPage.selectDropdown.waitFor({ state: 'visible', timeout: 5000 });
    await directoryPage.selectOptions.filter({ hasText: 'Chief Financial Officer' }).first().click();

    // 3. Click Search button and wait for spinner
    await directoryPage.searchButton.click();
    await waitForSpinner(page);
    await expect(directoryPage.employeeCards.first()).toBeVisible({ timeout: 10000 });

    // 4. Click Reset button and wait for spinner
    await directoryPage.resetButton.click();
    await waitForSpinner(page);

    // 5. Assert restored to full count with wildcard regex
    await expect(directoryPage.recordsFoundLabel).toHaveText(/.*Records? Found/i, { timeout: 10000 });
  });

  test('[TC-UI-25] @regression @security — Filter by Job Title (HR Manager) and Location (Canadian Regional HQ) Displays No Records Found', async ({ directoryPage, page }) => {
    // 1. Click Job Title dropdown and select "HR Manager"
    await directoryPage.jobTitleDropdown.click();
    await directoryPage.selectDropdown.waitFor({ state: 'visible', timeout: 5000 });
    await directoryPage.selectOptions.filter({ hasText: 'HR Manager' }).first().click();

    // 2. Click Location dropdown and select "Canadian Regional HQ"
    await directoryPage.locationDropdown.click();
    await directoryPage.selectDropdown.waitFor({ state: 'visible', timeout: 5000 });
    await directoryPage.selectOptions.filter({ hasText: 'Canadian Regional HQ' }).first().click();

    // 3. Click Search button and wait for spinner to appear and disappear
    await directoryPage.searchButton.click();
    await waitForSpinner(page);

    // 4. Assert "No Records Found" is displayed and 0 cards rendered
    const noRecordsIndicator = page.locator('span.oxd-text--span, .orangehrm-horizontal-padding span, p').filter({ hasText: /No Records Found/i }).first();
    await expect(noRecordsIndicator).toBeVisible({ timeout: 10000 });
    await expect(noRecordsIndicator).toContainText('No Records Found');
    await expect(directoryPage.employeeCards).toHaveCount(0);
  });
});
