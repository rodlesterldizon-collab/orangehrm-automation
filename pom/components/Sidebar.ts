import { Page, Locator } from '@playwright/test';

export class Sidebar {
  readonly page: Page;
  readonly container: Locator;
  readonly searchInput: Locator;

  constructor(page: Page) {
    this.page = page;
    this.container = page.locator('.oxd-sidepanel');
    this.searchInput = this.container.getByPlaceholder('Search');
  }

  getMenuItem(name: string): Locator {
    return this.container.locator('.oxd-main-menu-item').filter({ hasText: name });
  }

  async ensureVisible(): Promise<void> {
    const hamburger = this.page.locator('.oxd-topbar-header-hamburger, i.bi-list, button:has(.bi-list)');
    if (await hamburger.isVisible()) {
      // Check if sidebar menu items are already visible
      const isVisible = await this.container.isVisible();
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
}
