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
  readonly maintenanceNavigation: Locator;
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
    this.adminAccessHeading = this.page.getByRole('heading', { name: 'Administrator Access' });
    this.passwordInput = this.page.locator('input[name="password"]');
    this.confirmButton = this.page.getByRole('button', { name: 'Confirm' });
    this.cancelButton = this.page.getByRole('button', { name: 'Cancel' });

    // Authenticated Maintenance Section Locators
    this.maintenanceNavigation = this.page.getByRole('navigation', { name: 'Topbar Menu' });
    this.purgeRecordsDropdown = this.maintenanceNavigation.locator('ul li span').filter({ hasText: /Purge Records/i });
    this.accessRecordsTab = this.maintenanceNavigation.locator('ul li a').filter({ hasText: 'Access Records' });
    this.maintenanceContainer = this.page.locator('[class$="card-container"]');
    this.purgeRecordsHeader = this.maintenanceContainer.getByRole('heading', { name: 'Purge Employee Records' });
    this.purgeCandidateRecord = this.page.getByRole('menuitem', { name: 'Candidate Records' });
    this.purgeCandidateRecordsHeader = this.maintenanceContainer.getByRole('heading', { name: 'Purge Candidate Records' });
    this.accessRecordsHeader = this.maintenanceContainer.getByRole('heading', { name: 'Download Personal Data' });
  }

  async navigate(): Promise<void> {
    await this.goto('/web/index.php/maintenance/purgeEmployee');
  }

  /**
   * Confirms administrator access on the intermediary verification gate.
   * Uses the provided password or defaults to credentials from .env / .env.test.
   */
  async confirmAdministratorAccess(password?: string): Promise<void> {
    const adminPassword = password ?? getAdminCredentials().password;
    await this.passwordInput.fill(adminPassword);
    await Promise.all([
      this.page.waitForURL(/.*\/maintenance\//, { timeout: 15000 }),
      this.confirmButton.click(),
    ]);
  }

  /**
   * Navigates to Maintenance and completes the administrator access gate if prompted.
   */
  async navigateAndAuthenticate(password?: string): Promise<void> {
    await this.navigate();
    await this.page.waitForURL(/.*(\/auth\/adminVerify|\/maintenance\/)/, { timeout: 15000 });
    if (this.page.url().includes('/auth/adminVerify')) {
      await this.confirmAdministratorAccess(password);
    }
  }

  /**
   * Clicks on the Access Records tab in the navigation bar.
   */
  async clickAccessRecords(): Promise<void> {
    await this.accessRecordsTab.click();
  }
}
