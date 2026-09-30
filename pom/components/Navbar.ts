import { Page, Locator } from '@playwright/test';

export class Navbar {
  readonly page: Page;
  readonly root: Locator;
  readonly container: Locator;
  readonly breadcrumbHeader: Locator;
  readonly userDropdown: Locator;
  readonly userDropdownName: Locator;
  readonly userDropdownMenu: Locator;
  readonly logoutLink: Locator;
  readonly hamburgerButton: Locator;
  readonly aboutLink: Locator;
  readonly supportLink: Locator;
  readonly changePasswordLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.root = this.page.getByRole('banner').or(this.page.locator('header')).first();
    this.container = this.root;
    this.breadcrumbHeader = this.root.locator('h6').first();
    this.hamburgerButton = this.root.getByRole('button').filter({ has: this.page.locator('i') }).first();
    this.userDropdown = this.root.getByRole('listitem').last();
    this.userDropdownName = this.userDropdown.locator('p, span').first();
    this.userDropdownMenu = this.userDropdown.getByRole('menu');
    this.logoutLink = this.page.getByRole('menuitem', { name: 'Logout' });
    this.aboutLink = this.page.getByRole('menuitem', { name: 'About' });
    this.supportLink = this.page.getByRole('menuitem', { name: 'Support' });
    this.changePasswordLink = this.page.getByRole('menuitem', { name: 'Change Password' });
  }

  async toggleHamburger(): Promise<void> {
    await this.hamburgerButton.click();
  }

  async openUserDropdown(): Promise<void> {
    await this.userDropdown.click();
  }

  async logout(): Promise<void> {
    await this.openUserDropdown();
    await this.logoutLink.click();
  }
}
