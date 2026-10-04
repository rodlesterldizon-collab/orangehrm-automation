import { test, expect } from '../../fixtures/page-objects.fixture.js';

test.describe('Maintenance Module — Authenticated Maintenance Section Suite', () => {
  test.beforeEach(async ({ page, maintenancePage }) => {
    await maintenancePage.navigate();
  });

  test('[TC-MAINT-01] @smoke @p1 @maintenance — Administrator Verification & Purge Records Landing State', async ({
    maintenancePage,
    page,
  }) => {
    // 1. Verify landing on purgeEmployee before pressing tab
    await expect(page).toHaveURL(/.*\/maintenance\/purgeEmployee/);

    // 2. Verify landing card container and default Purge Employee Records header
    await expect(maintenancePage.maintenanceContainer).toBeVisible();
    await expect(maintenancePage.purgeRecordsHeader).toBeVisible();
    await expect(maintenancePage.purgeRecordsHeader).toContainText('Purge Employee Records');

    // 3. Verify navigation elements
    await expect(maintenancePage.purgeRecordsDropdown).toBeVisible();
    await expect(maintenancePage.accessRecordsTab).toBeVisible();
  });

  test('[TC-MAINT-02] @sanity @p2 @maintenance — Access Records Tab Navigation & Header Update', async ({
    maintenancePage,
    page,
  }) => {
    // 1. Verify Access Records tab is visible
    await expect(maintenancePage.accessRecordsTab).toBeVisible();

    // 2. Set up response listener before clicking so we don't miss the navigation request
    const responsePromise = page.waitForResponse(
      (response) =>
        response.url().includes('/maintenance/accessEmployeeData') &&
        (response.status() === 200 || response.status() === 304),
      { timeout: 20000 }
    ).catch(() => null); // non-fatal if SPA doesn't fire a nav request

    // 3. Press the Access Records tab and wait for navigation + spinner
    await maintenancePage.accessRecordsTab.click();
    await responsePromise;
    await expect(page).toHaveURL(/.*\/maintenance\/accessEmployeeData/, { timeout: 15000 });
    await maintenancePage.waitForSpinner();

    // 4. Check header changed to Download Personal Data
    await expect(maintenancePage.accessRecordsHeader).toBeVisible({ timeout: 15000 });
    await expect(maintenancePage.accessRecordsHeader).toContainText('Download Personal Data');
  });

  test('[TC-MAINT-03] @sanity @p2 @maintenance — Purge Candidate Records Dropdown Navigation', async ({
    maintenancePage,
    page,
  }) => {
    // 1. Open Purge Records dropdown menu
    await expect(maintenancePage.purgeRecordsDropdown).toBeVisible({ timeout: 10000 });
    await maintenancePage.openPurgeRecordsDropdown();
    const responsePromise = page.waitForResponse(
      (response) =>
        response.url().includes('/maintenance/purgeCandidateData') &&
        (response.status() === 200 || response.status() === 304),
      { timeout: 20000 }
    ).catch(() => null);

    // 2. Select Candidate Records option
    await maintenancePage.selectCandidateRecords();
    await responsePromise;

    // 3. Verify URL changed to purgeCandidateData
    await expect(page).toHaveURL(/.*\/maintenance\/purgeCandidateData/, { timeout: 15000 });

    // 4. Verify header updated to Purge Candidate Records
    await expect(maintenancePage.purgeCandidateRecordsHeader).toBeVisible({ timeout: 15000 });
    await expect(maintenancePage.purgeCandidateRecordsHeader).toContainText(/Purge Candidate Records/i);
  });
});
