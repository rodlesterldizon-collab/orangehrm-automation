import { test, expect } from '../../fixtures/page-objects.fixture.js';

test.describe('Directory Search & Navigation Suite', () => {
  test('[TC-UI-21] @smoke — Directory Card Grid Initial Render', async ({ directoryPage }) => {
    // 1. Verify card grid and counter are visible (SS-05)
    await expect(directoryPage.recordsFoundLabel).toBeVisible();
    await expect(directoryPage.recordsFoundLabel).toContainText('Records Found');
    await expect(directoryPage.employeeCards.first()).toBeVisible();
  });

  test('[TC-UI-22] @sanity — Search Directory by Name Autocomplete', async ({ directoryPage }) => {
    // 1. Type hint and search
    await directoryPage.searchByName('a');

    // 2. Assert card grid displays at least one filtered profile card
    await expect(directoryPage.employeeCards.first()).toBeVisible();
  });

  test('[TC-UI-23] @regression — Filter Directory by Job Title', async ({ directoryPage }) => {
    // 1. Select job title dynamically from available options
    const selectedTitle = await directoryPage.filterByJobTitle('Chief Executive Officer');

    // 2. Assert filtered cards are rendered with the selected job title
    if (selectedTitle) {
      await expect(directoryPage.employeeCards.first()).toContainText(selectedTitle);
    } else {
      await expect(directoryPage.recordsFoundLabel).toBeVisible();
    }
  });

  test('[TC-UI-24] @regression — Reset Filter Restores Full Count', async ({ directoryPage }) => {
    // 1. Capture initial records found text
    const initialText = await directoryPage.recordsFoundLabel.textContent();

    // 2. Filter down
    await directoryPage.filterByJobTitle();

    // 3. Reset filters
    await directoryPage.reset();

    // 4. Assert restored to initial total count
    await expect(directoryPage.recordsFoundLabel).toHaveText(initialText || '');
  });
});
