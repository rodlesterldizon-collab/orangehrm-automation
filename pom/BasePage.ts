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

  constructor(page: Page, request: APIRequestContext) {
    this.page = page;
    this.request = request;
    this.navbar = new Navbar(page);
    this.sidebar = new Sidebar(page);
    this.toast = page.locator('.oxd-toast');
    this.toastMessage = page.locator('.oxd-toast-content-text');
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
}
