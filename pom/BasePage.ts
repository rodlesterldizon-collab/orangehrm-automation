import { Page, APIRequestContext, Locator } from '@playwright/test';
import { Navbar } from './components/Navbar.js';
import { Sidebar } from './components/Sidebar.js';

export class BasePage {
  readonly page: Page;
  readonly request: APIRequestContext;
  readonly root: Locator;
  readonly navbar: Navbar;
  readonly sidebar: Sidebar;
  readonly toast: Locator;
  readonly toastMessage: Locator;
  readonly spinner: Locator;

  constructor(page: Page, request: APIRequestContext) {
    this.page = page;
    this.request = request;
    this.root = this.page.getByRole('main');
    this.navbar = new Navbar(page);
    this.sidebar = new Sidebar(page);
    this.toast = this.page.getByRole('alert');
    this.toastMessage = this.toast.locator('p').last();
    this.spinner = this.page.locator('.oxd-loading-spinner');
  }

  async goto(path: string): Promise<void> {
    await this.page.goto(path);
  }

  async waitForToast(): Promise<void> {
    await this.toast.waitFor({ state: 'visible', timeout: 10000 });
  }

  async getToastText(): Promise<string> {
    await this.waitForToast();
    return (await this.toastMessage.textContent()) || '';
  }

  async waitForSpinner(timeout: number = 15000): Promise<void> {
    try {
      await this.spinner.waitFor({ state: 'visible', timeout: 2500 });
    } catch {
      // Spinner may have completed instantaneously
    }
    await this.spinner.waitFor({ state: 'hidden', timeout });
  }
}
