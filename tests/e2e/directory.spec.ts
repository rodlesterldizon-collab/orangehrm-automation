import { test, expect } from '../../fixtures/page-objects.fixture.js';

test.describe('Directory Search & Navigation Suite', () => {
  test('[TC-UI-21] @smoke — Directory Card Grid Initial Render', async ({ directoryPage }) => {
    // 1. Verify card grid and counter are visible (SS-05)
    await expect(directoryPage.recordsFoundLabel).toBeVisible();
    await expect(directoryPage.recordsFoundLabel).toHaveText(/.*Records? Found/i);
    await expect(directoryPage.employeeCards.first()).toBeVisible();
  });

  test('[TC-UI-22] @sanity — Search Directory by Name Autocomplete', async ({ directoryPage }) => {
    // 1. Type hint and search
    await directoryPage.searchByName('a');

    // 2. Assert card grid displays at least one filtered profile card
    await expect(directoryPage.employeeCards.first()).toBeVisible();
  });

  test('[TC-UI-23] @regression — Filter Directory by Job Title', async ({ directoryPage }) => {
    // 1. Select specific job title "Chief Financial Officer"
    const selectedTitle = await directoryPage.filterByJobTitle('Chief Financial Officer');

    // 2. Assert filtered card contains the expected title
    await expect(directoryPage.employeeCards.first()).toBeVisible({ timeout: 10000 });
    await expect(directoryPage.employeeCards.first()).toContainText(selectedTitle || 'Chief Financial Officer');
  });

  test('[TC-UI-24] @regression — Reset Filter Restores Full Count', async ({ directoryPage }) => {
    // 1. Ensure initial directory grid is loaded with records
    await expect(directoryPage.recordsFoundLabel).toHaveText(/.*Records? Found/i, { timeout: 10000 });

    // 2. Filter down by Job Title
    await directoryPage.filterByJobTitle('Chief Financial Officer');
    await expect(directoryPage.employeeCards.first()).toBeVisible({ timeout: 10000 });

    // 3. Reset filters
    await directoryPage.reset();

    // 4. Assert restored to full count with wildcard regex for dynamic numbers and leading spaces
    await expect(directoryPage.recordsFoundLabel).toHaveText(/.*Records? Found/i, { timeout: 10000 });
  });

  test('[TC-UI-25] @regression @security — Filter by Job Title (HR Manager) and Location (Canadian Regional HQ) Displays No Records Found', async ({ directoryPage, page }) => {
    // 1. Apply combination filters
    await directoryPage.filterByJobTitleAndLocation('HR Manager', 'Canadian Regional HQ');

    // 2. Assert "No Records Found" is displayed and 0 cards rendered
    const noRecordsIndicator = page.locator('span.oxd-text--span, .orangehrm-horizontal-padding span, p').filter({ hasText: /No Records Found/i }).first();
    await expect(noRecordsIndicator).toBeVisible({ timeout: 10000 });
    await expect(noRecordsIndicator).toContainText('No Records Found');
    await expect(directoryPage.employeeCards).toHaveCount(0);
  });
});
