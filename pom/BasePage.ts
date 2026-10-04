import { Page, APIRequestContext, Locator } from '@playwright/test';
import { Navbar } from './components/Navbar.js';
import { Sidebar } from './components/Sidebar.js';

export class BasePage {
  readonly page: Page;
  readonly request: APIRequestContext;
  readonly navbar: Navbar;
  readonly sidebar: Sidebar;
  readonly toast: Locator;
  readonly toastMessage: Locator;
  readonly spinner: Locator;
  readonly loadingSpinner: Locator;

  constructor(page: Page, request: APIRequestContext) {
    this.page = page;
    this.request = request;
    this.navbar = new Navbar(page);
    this.sidebar = new Sidebar(page);
    this.toast = page.locator('#oxd-toaster_1');
    this.toastMessage = this.toast.locator('p').first();
    this.spinner = page.locator('div[class*="loading-spinner"]').last();
    this.loadingSpinner = this.spinner;
  }

  async goto(path: string): Promise<void> {
    await this.page.goto(path);
  }

  async waitForSpinner(timeout: number = 15000): Promise<void> {
    await this.page.evaluate(() => new Promise((resolve) => requestAnimationFrame(resolve))).catch(() => null);
    await this.spinner.waitFor({ state: 'hidden', timeout }).catch(() => null);
  }
}
