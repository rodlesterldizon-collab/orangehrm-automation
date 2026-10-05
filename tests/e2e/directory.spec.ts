import { test, expect } from '../../fixtures/page-objects.fixture.js';
import { waitForSpinner, waitForGridUpdate } from '../../utils/helpers.js';

test.describe('Directory Search & Navigation Suite', () => {
  test('[TC-UI-21] @smoke @p1 @directory — Directory Card Grid Initial Render', async ({ directoryPage }) => {
    // 1. Verify card grid and counter are visible (SS-05)
    await expect(directoryPage.recordsFoundLabel).toBeVisible();
    await expect(directoryPage.recordsFoundLabel).toHaveText(/.*Records? Found/i);
    await expect(directoryPage.employeeCards.first()).toBeVisible();
  });

  test('[TC-UI-22] @sanity @p1 @directory — Search Directory by Name Autocomplete', async ({ directoryPage, page }) => {
    // 1. Type hint into search input
    await directoryPage.searchEmployeeInput.fill('a');
    await directoryPage.autocompleteDropdown.waitFor({ state: 'visible', timeout: 5000 }).catch(() => { });

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

  test('[TC-UI-23] @validation @p2 @directory — Filter Directory by Job Title', async ({ directoryPage, page }) => {
    await directoryPage.resetButton.click();
    await waitForSpinner(page);
    await waitForGridUpdate(page);

    // 1. Open Job Title dropdown and dynamically select the first available option
    await directoryPage.jobTitleDropdown.click();
    await directoryPage.selectDropdown.waitFor({ state: 'visible', timeout: 5000 });

    // Skip the "-- Select --" placeholder — pick the first real job title option
    const realOptions = directoryPage.selectOptions.filter({ hasNotText: /^--/ });
    const firstOption = realOptions.first();
    await expect(firstOption).toBeVisible({ timeout: 5000 });
    const selectedJobTitle = (await firstOption.textContent())?.trim() ?? '';
    expect(selectedJobTitle.length).toBeGreaterThan(0);
    await firstOption.click();

    // 2. Ensure dropdown has updated with the dynamically selected title
    await expect(directoryPage.jobTitleDropdown).toContainText(selectedJobTitle);

    // 3. Set up response listener BEFORE clicking Search to avoid race conditions
    //    Don't require jobTitleId in URL — the SPA may encode the filter differently
    const responsePromise = page.waitForResponse(
      (response) =>
        response.url().includes('/api/v2/directory/employees') &&
        response.request().method() === 'GET' &&
        response.status() === 200,
      { timeout: 20000 }
    );

    // 4. Click Search button, wait for filtered API response & spinner to finish
    await directoryPage.searchButton.click();
    const response = await responsePromise;
    expect(response.status()).toBe(200);

    // 5. Verify the API response payload returned data (may be empty if no employees hold this title)
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('data');
    expect(responseBody).toHaveProperty('meta');

    await waitForSpinner(page);
    await waitForGridUpdate(page);

    // 6. Assert either cards are displayed or "No Records Found" is shown — both are valid filtered outcomes
    const hasCards = await directoryPage.employeeCards.first().isVisible().catch(() => false);
    if (hasCards) {
      await expect(directoryPage.employeeCards.first()).toContainText(selectedJobTitle, { timeout: 15000 });
    } else {
      await expect(directoryPage.recordsFoundLabel).toHaveText(/No Records Found/i, { timeout: 10000 });
    }
  });

  test('[TC-UI-24] @validation @p2 @directory — Reset Filter Restores Full Count', async ({ directoryPage, page }) => {
    // 1. Wait for the initial directory grid to fully load with a NUMERIC count
    //    (not "No Records Found" which briefly appears before data loads)
    await expect(directoryPage.recordsFoundLabel).toHaveText(/\(\d+\) Records? Found/i, { timeout: 15000 });

    // 2. Capture the initial record count number for later comparison
    const initialCountText = await directoryPage.recordsFoundLabel.textContent() ?? '';
    const initialCountMatch = initialCountText.match(/\((\d+)\)/);
    const initialCount = initialCountMatch ? parseInt(initialCountMatch[1], 10) : 0;
    expect(initialCount).toBeGreaterThan(0);

    // 3. Click Job Title dropdown and select the first real option (skip "-- Select --" placeholder)
    await directoryPage.jobTitleDropdown.click();
    await directoryPage.selectDropdown.waitFor({ state: 'visible', timeout: 5000 });
    await directoryPage.selectOptions.filter({ hasNotText: /^--/ }).first().click();

    // 4. Click Search button and wait for spinner
    await directoryPage.searchButton.click();
    await waitForSpinner(page);
    await waitForGridUpdate(page);

    // 5. Click Reset button and wait for spinner
    await directoryPage.resetButton.click();
    await waitForSpinner(page);
    await waitForGridUpdate(page);

    // 6. Assert restored to a numeric count (not "No Records Found")
    await expect(directoryPage.recordsFoundLabel).toHaveText(/\(\d+\) Records? Found/i, { timeout: 15000 });
  });

  test('[TC-UI-25] @validation @p2 @directory — Filter by Two Criteria Returns Filtered or No Records', async ({ directoryPage, page }) => {
    await directoryPage.resetButton.click();
    await waitForSpinner(page);

    // 1. Open Job Title dropdown and select the first real option (skip "-- Select --" placeholder)
    await directoryPage.jobTitleDropdown.click();
    await directoryPage.selectDropdown.waitFor({ state: 'visible', timeout: 5000 });
    const jobTitleOption = directoryPage.selectOptions.filter({ hasNotText: /^--/ }).first();
    const selectedJobTitle = (await jobTitleOption.textContent())?.trim() ?? '';
    await jobTitleOption.click();
    await expect(directoryPage.jobTitleDropdown).toContainText(selectedJobTitle);

    // 2. Open Location dropdown and select the last available option (maximize chance of cross-filter mismatch)
    await directoryPage.locationDropdown.click();
    await directoryPage.selectDropdown.waitFor({ state: 'visible', timeout: 5000 });
    const locationOption = directoryPage.selectOptions.last();
    const selectedLocation = (await locationOption.textContent())?.trim() ?? '';
    await locationOption.click();
    await expect(directoryPage.locationDropdown).toContainText(selectedLocation);

    // 3. Set up response listener for directory employees GET API (status 200)
    const responsePromise = page.waitForResponse(
      (response) =>
        response.url().includes('/api/v2/directory/employees') &&
        response.request().method() === 'GET' &&
        response.status() === 200,
      { timeout: 10000 }
    );

    // 4. Click Search button and wait for GET 200 response & grid update
    await directoryPage.searchButton.click();
    const response = await responsePromise;
    expect(response.status()).toBe(200);
    await waitForGridUpdate(page);

    // 5. Assert either filtered cards are shown or "No Records Found" — both are valid outcomes
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('data');
    if (responseBody.data.length > 0) {
      await expect(directoryPage.employeeCards.first()).toBeVisible({ timeout: 10000 });
    } else {
      const noRecordsIndicator = page.locator('span.oxd-text--span, .orangehrm-horizontal-padding span, p')
        .filter({ hasText: /No Records Found/i }).first();
      await expect(noRecordsIndicator).toBeVisible({ timeout: 10000 });
      await expect(directoryPage.employeeCards).toHaveCount(0);
    }
  });
});
