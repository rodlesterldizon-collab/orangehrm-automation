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
    await expect(maintenancePage.purgeRecordsHeader).toHaveText('Purge Employee Records');

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

    // 2. Press the Access Records tab
    await maintenancePage.accessRecordsTab.click();

    // 3. Check URL changed to accessEmployeeData
    await expect(page).toHaveURL(/.*\/maintenance\/accessEmployeeData/);

    // 4. Check header changed to Download Personal Data
    await expect(maintenancePage.accessRecordsHeader).toBeVisible();
    await expect(maintenancePage.accessRecordsHeader).toHaveText('Download Personal Data');
  });

  test('[TC-MAINT-03] @sanity @p2 @maintenance — Purge Candidate Records Dropdown Navigation', async ({
    maintenancePage,
    page,
  }) => {
    // 1. Open Purge Records dropdown menu
    await expect(maintenancePage.purgeRecordsDropdown).toBeVisible();
    await maintenancePage.purgeRecordsDropdown.click();

    // 2. Select Candidate Records option
    await maintenancePage.purgeCandidateRecord.click();

    // 3. Verify URL changed to purgeCandidate
    await expect(page).toHaveURL(/.*\/maintenance\/purgeCandidateData/);

    // 4. Verify header updated to Purge Candidate Records
    await expect(maintenancePage.purgeCandidateRecordsHeader).toBeVisible();
    await expect(maintenancePage.purgeCandidateRecordsHeader).toHaveText('Purge Candidate Records');
  });
});
