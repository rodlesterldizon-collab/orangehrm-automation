import { Page, Locator } from '@playwright/test';

export class Sidebar {
  readonly page: Page;
  readonly root: Locator;
  readonly container: Locator;
  readonly searchInput: Locator;
  readonly sidebarToggle: Locator;
  readonly adminAccessContainer: Locator;
  readonly adminPasswordInput: Locator;
  readonly adminConfirmButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.root = this.page.getByRole('navigation').first().or(this.page.locator('aside')).first();
    this.sidebarToggle = this.root.getByRole('navigation', { name: 'Sidepanel' }).getByRole('button');
    this.container = this.root;
    this.searchInput = this.root.getByPlaceholder('Search');
    
    // Maintenance Administrator Access Password Re-Auth Modal
    this.adminAccessContainer = this.page.locator('.orangehrm-admin-access-container, form').first();
    this.adminPasswordInput = this.page.locator('input[type="password"]');
    this.adminConfirmButton = this.page.getByRole('button', { name: 'Confirm' }).or(this.page.locator('button[type="submit"]'));
  }

  getMenuItem(name: string): Locator {
    return this.root.getByRole('link').filter({ hasText: name });
  }

  async ensureVisible(): Promise<void> {
    const hamburger = this.page.locator('header').getByRole('button').first();
    if (await hamburger.isVisible().catch(() => false)) {
      const isVisible = await this.container.isVisible().catch(() => false);
      if (!isVisible) {
        await hamburger.click();
        await this.container.waitFor({ state: 'visible', timeout: 5000 });
      }
    }
  }

  async navigateTo(menuName: string): Promise<void> {
    await this.ensureVisible();
    await this.getMenuItem(menuName).click();
  }

  async handleMaintenanceReAuthIfPrompted(password: string): Promise<boolean> {
    const isPrompted = await this.adminPasswordInput.isVisible({ timeout: 3500 }).catch(() => false);
    if (isPrompted) {
      await this.adminPasswordInput.fill(password);
      await this.adminConfirmButton.click();
      return true;
    }
    return false;
  }

  /**
   * Retrieves the primary content view/container for any sidebar module
   * to verify that the destination page DOM has rendered successfully.
   */
  getModuleView(name: string): Locator {
    switch (name) {
      case 'Admin':
      case 'PIM':
      case 'Recruitment':
        return this.page.locator('.oxd-table-filter, .oxd-table').first();
      case 'Leave':
      case 'Claim':
        return this.page.locator('.oxd-table-filter, .oxd-table, .orangehrm-container').first();
      case 'Time':
      case 'Performance':
        return this.page.locator('.orangehrm-card-container, form, .oxd-table-filter').first();
      case 'My Info':
        return this.page.locator('.orangehrm-edit-employee, form').first();
      case 'Dashboard':
        return this.page.locator('.orangehrm-dashboard-grid, div[class*="dashboard"]').first();
      case 'Directory':
        return this.page.locator('.oxd-table-filter, .oxd-grid-4, div[class*="directory"]').first();
      case 'Maintenance':
        return this.page.locator('form, .orangehrm-card-container, .orangehrm-admin-access-container').first();
      case 'Buzz':
        return this.page.locator('.orangehrm-buzz-newsfeed, div[class*="buzz"]').first();
      default:
        return this.page.locator('.orangehrm-card-container, .oxd-table-filter, form').first();
    }
  }
}
