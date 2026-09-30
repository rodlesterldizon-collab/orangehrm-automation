import { Page, Locator } from '@playwright/test';

export class Sidebar {
  readonly page: Page;
  readonly root: Locator;
  readonly container: Locator;
  readonly searchInput: Locator;

  constructor(page: Page) {
    this.page = page;
    this.root = this.page.getByRole('navigation').first().or(this.page.locator('aside')).first();
    this.container = this.root;
    this.searchInput = this.root.getByPlaceholder('Search');
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
}
