import { Page, Locator } from '@playwright/test';

export class Navbar {
  readonly page: Page;
  readonly root: Locator;
  readonly container: Locator;
  readonly titleHeader: Locator;
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
    this.titleHeader = this.root.locator('header, h6').first();
    this.breadcrumbHeader = this.titleHeader;
    this.hamburgerButton = this.root.locator('i').first();
    this.userDropdown = this.root.getByRole('listitem').last();
    this.userDropdownName = this.userDropdown.locator('p, span').first();
    this.userDropdownMenu = this.userDropdown.getByRole('menu');
    this.logoutLink = this.page.getByRole('menuitem', { name: 'Logout' });
    this.aboutLink = this.page.getByRole('menuitem', { name: 'About' });
    this.supportLink = this.page.getByRole('menuitem', { name: 'Support' });
    this.changePasswordLink = this.page.getByRole('menuitem', { name: 'Change Password' });
  }

  async openUserMenu(): Promise<void> {
    await this.userDropdown.click();
  }

  async logout(): Promise<void> {
    await this.openUserMenu();
    await this.logoutLink.click();
  }
}
