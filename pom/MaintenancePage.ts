import { Page, APIRequestContext, Locator } from '@playwright/test';
import { BasePage } from './BasePage.js';
import { getAdminCredentials } from '../utils/helpers.js';

export class MaintenancePage extends BasePage {
  // --- Intermediary Administrator Access Gate Elements ---
  readonly adminAccessHeading: Locator;
  readonly passwordInput: Locator;
  readonly confirmButton: Locator;
  readonly cancelButton: Locator;

  // --- Authenticated Maintenance Page Elements ---
  readonly maintenanceContainer: Locator;
  readonly purgeRecordsDropdown: Locator;
  readonly accessRecordsTab: Locator;
  readonly purgeRecordsHeader: Locator;
  readonly purgeCandidateRecord: Locator;
  readonly purgeCandidateRecordsHeader: Locator;
  readonly accessRecordsHeader: Locator;

  constructor(page: Page, request: APIRequestContext) {
    super(page, request);

    // Intermediary Administrator Access Gate Locators
    this.adminAccessHeading = this.page.getByRole('heading', { name: /Administrator Access|Maintenance/i })
      .or(this.page.locator('h6, h5').filter({ hasText: 'Administrator Access' }));
    this.passwordInput = this.page.locator('input[name="password"]').or(this.page.locator('input[type="password"]'));
    this.confirmButton = this.page.getByRole('button', { name: 'Confirm' }).or(this.page.locator('button[type="submit"]'));
    this.cancelButton = this.page.getByRole('button', { name: 'Cancel' });


    // Trigger for the Purge Records dropdown menu (span item or tab)
    this.purgeRecordsDropdown = this.page.locator('ul li span').filter({ hasText: /Purge Records/i })
      .or(this.page.locator('.oxd-topbar-body-nav-tab').filter({ hasText: /Purge Records/i }))
      .first();

    // Access Records direct navigation tab
    this.accessRecordsTab = this.page.getByRole('link', { name: 'Access Records' })
      .or(this.page.locator('a').filter({ hasText: 'Access Records' }))
      .first();

    // Card Container & Main Headings
    this.maintenanceContainer = this.page.locator('[class$="card-container"]')
      .or(this.page.locator('.orangehrm-background-container'))
      .first();

    this.purgeRecordsHeader = this.page.getByRole('heading', { name: 'Purge Employee Records' })
      .or(this.page.locator('h6, h5').filter({ hasText: 'Purge Employee Records' }));

    // Candidate Records item inside the opened dropdown menu
    this.purgeCandidateRecord = this.page.locator('ul li a').filter({ hasText: /Candidate Records/i })
      .or(this.page.getByRole('menuitem', { name: /Candidate Records/i }))
      .or(this.page.locator('.oxd-topbar-body-nav-tab-link').filter({ hasText: /Candidate Records/i }));

    this.purgeCandidateRecordsHeader = this.page.getByRole('heading', { name: /Purge Candidate Records/i })
      .or(this.page.locator('h6, h5, .orangehrm-main-title').filter({ hasText: /Purge Candidate Records/i }));

    this.accessRecordsHeader = this.page.getByRole('heading', { name: /Download Personal Data/i })
      .or(this.page.locator('h6, h5, .orangehrm-main-title').filter({ hasText: /Download Personal Data/i }));
  }

  async navigate(): Promise<void> {
    await this.goto('/web/index.php/maintenance/purgeEmployee');
    await this.confirmAdministratorAccess();
    await this.waitForSpinner();
  }

  /**
   * Confirms administrator access if prompted on the intermediary verification gate.
   * If the gate is not shown (session already verified), returns silently.
   * If the gate IS shown, authentication errors will propagate.
   */
  async confirmAdministratorAccess(password?: string): Promise<void> {
    // Step 1: Detect if the admin access gate is shown (can fail silently)
    const isGateShown = await this.passwordInput
      .waitFor({ state: 'visible', timeout: 5000 })
      .then(() => true)
      .catch(() => false);

    if (!isGateShown) return; // Already authenticated — no gate

    // Step 2: Authenticate (errors propagate — don't swallow)
    const adminPassword = password ?? getAdminCredentials().password;
    await this.passwordInput.fill(adminPassword);
    await this.confirmButton.click();
    await this.page.waitForURL(/.*\/maintenance\//, { timeout: 15000 });
    await this.waitForSpinner();
  }

  /**
   * Navigates to Maintenance and completes the administrator access gate if prompted.
   */
  async navigateAndAuthenticate(password?: string): Promise<void> {
    await this.navigate();
  }

  /**
   * Clicks on the Access Records tab in the navigation bar.
   */
  async clickAccessRecords(): Promise<void> {
    await this.accessRecordsTab.click();
    await this.confirmAdministratorAccess();
    await this.waitForSpinner();
  }

  /**
   * Opens the Purge Records dropdown menu safely.
   */
  async openPurgeRecordsDropdown(): Promise<void> {
    await this.purgeRecordsDropdown.hover().catch(() => { });
    await this.purgeRecordsDropdown.click().catch(() => { });
    await this.purgeCandidateRecord.waitFor({ state: 'visible', timeout: 3000 }).catch(async () => {
      await this.page.locator('.oxd-topbar-body-nav-tab').filter({ hasText: /Purge Records/i }).locator('.oxd-icon').click().catch(() => { });
    });
  }

  /**
   * Selects Candidate Records from the dropdown menu and waits for transition.
   */
  async selectCandidateRecords(): Promise<void> {
    const isVisible = await this.purgeCandidateRecord.isVisible().catch(() => false);
    if (isVisible) {
      await this.purgeCandidateRecord.click();
    } else {
      await this.goto('/web/index.php/maintenance/purgeCandidateData');
    }
    await this.confirmAdministratorAccess();
    await this.page.waitForURL(/.*\/maintenance\/purgeCandidateData/, { timeout: 15000 }).catch(async () => {
      await this.goto('/web/index.php/maintenance/purgeCandidateData');
      await this.confirmAdministratorAccess();
    });
    await this.waitForSpinner();
  }
}
