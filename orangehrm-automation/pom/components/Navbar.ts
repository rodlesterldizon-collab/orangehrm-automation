import { Page, Locator } from '@playwright/test';

export class Navbar {
  readonly page: Page;
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
    this.container = page.locator('.oxd-topbar');
    this.breadcrumbHeader = page.locator('.oxd-topbar-header-breadcrumb');
    this.hamburgerButton = page.locator('.oxd-topbar-header-hamburger, i.bi-list, button:has(.bi-list)');
    this.userDropdown = page.locator('.oxd-userdropdown');
    this.userDropdownName = page.locator('.oxd-userdropdown-name');
    this.userDropdownMenu = page.locator('.oxd-userdropdown-tab');
    this.logoutLink = page.getByRole('menuitem', { name: 'Logout' });
    this.aboutLink = page.getByRole('menuitem', { name: 'About' });
    this.supportLink = page.getByRole('menuitem', { name: 'Support' });
    this.changePasswordLink = page.getByRole('menuitem', { name: 'Change Password' });
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
