import { Page, Locator } from '@playwright/test';

export class Sidebar {
  readonly page: Page;
  readonly root: Locator;
  readonly container: Locator;
  readonly searchInput: Locator;
  readonly sidebarToggle: Locator;

  // Maintenance Administrator Access Password Re-Auth Modal
  readonly adminAccessContainer: Locator;
  readonly adminPasswordInput: Locator;
  readonly adminConfirmButton: Locator;

  // Sidebar Menu Items
  readonly adminMenuItem: Locator;
  readonly pimMenuItem: Locator;
  readonly leaveMenuItem: Locator;
  readonly timeMenuItem: Locator;
  readonly recruitmentMenuItem: Locator;
  readonly myInfoMenuItem: Locator;
  readonly performanceMenuItem: Locator;
  readonly dashboardMenuItem: Locator;
  readonly directoryMenuItem: Locator;
  readonly maintenanceMenuItem: Locator;
  readonly claimMenuItem: Locator;
  readonly buzzMenuItem: Locator;

  // Module Headings / Primary Content Views
  readonly adminView: Locator;
  readonly pimView: Locator;
  readonly leaveView: Locator;
  readonly timeView: Locator;
  readonly recruitmentView: Locator;
  readonly myInfoView: Locator;
  readonly performanceView: Locator;
  readonly dashboardView: Locator;
  readonly directoryView: Locator;
  readonly maintenanceView: Locator;
  readonly claimView: Locator;
  readonly buzzView: Locator;

  constructor(page: Page) {
    this.page = page;
    this.root = this.page.getByRole('navigation').first().or(this.page.locator('aside')).first();
    this.sidebarToggle = this.root.getByRole('navigation', { name: 'Sidepanel' }).getByRole('button');
    this.container = this.root;
    this.searchInput = this.root.getByPlaceholder('Search');

    // Maintenance Administrator Access Password Re-Auth Modal
    this.adminAccessContainer = this.page.locator('form').first();
    this.adminPasswordInput = this.page.locator('input[type="password"]');
    this.adminConfirmButton = this.page.getByRole('button', { name: 'Confirm' }).or(this.page.locator('button[type="submit"]'));

    // Sidebar Menu Items (referencing li.oxd-main-menu-item-wrapper and a.oxd-main-menu-item)
    this.adminMenuItem = this.root.locator('li a').filter({ hasText: 'Admin' });
    this.pimMenuItem = this.root.locator('li a').filter({ hasText: 'PIM' });
    this.leaveMenuItem = this.root.locator('li a').filter({ hasText: 'Leave' });
    this.timeMenuItem = this.root.locator('li a').filter({ hasText: 'Time' });
    this.recruitmentMenuItem = this.root.locator('li a').filter({ hasText: 'Recruitment' });
    this.myInfoMenuItem = this.root.locator('li a').filter({ hasText: 'My Info' });
    this.performanceMenuItem = this.root.locator('li a').filter({ hasText: 'Performance' });
    this.dashboardMenuItem = this.root.locator('li a').filter({ hasText: 'Dashboard' });
    this.directoryMenuItem = this.root.locator('li a').filter({ hasText: 'Directory' });
    this.maintenanceMenuItem = this.root.locator('li a').filter({ hasText: 'Maintenance' });
    this.claimMenuItem = this.root.locator('li a').filter({ hasText: 'Claim' });
    this.buzzMenuItem = this.root.locator('li a').filter({ hasText: 'Buzz' });

    // Module Primary Headings / Views
    this.adminView = this.page.getByRole('heading', { name: 'User Management' })
      .or(this.page.locator('h6').filter({ hasText: 'User Management' }));
    this.pimView = this.page.getByRole('heading', { name: 'PIM' })
      .or(this.page.locator('h6').filter({ hasText: 'PIM' }));
    this.leaveView = this.page.getByRole('heading', { name: 'Leave' })
      .or(this.page.locator('h6').filter({ hasText: 'Leave' }));
    this.timeView = this.page.getByRole('heading', { name: /Time/i })
      .or(this.page.locator('h6').filter({ hasText: 'Timesheets' }));
    this.recruitmentView = this.page.getByRole('heading', { name: 'Recruitment' })
      .or(this.page.locator('h6').filter({ hasText: 'Recruitment' }));
    this.myInfoView = this.page.getByRole('heading', { name: 'Personal Details' })
      .or(this.page.locator('h6').filter({ hasText: 'Personal Details' }));
    this.performanceView = this.page.getByRole('heading', { name: 'Employee Reviews' })
      .or(this.page.locator('h5').filter({ hasText: 'Employee Reviews' }));
    this.dashboardView = this.page.getByRole('heading', { name: 'Dashboard' })
      .or(this.page.locator('h6').filter({ hasText: 'Dashboard' }));
    this.directoryView = this.page.getByRole('heading', { name: 'Directory' })
      .or(this.page.locator('h6').filter({ hasText: 'Directory' }));
    this.maintenanceView = this.page.getByRole('heading', { name: /Purge Records/i })
      .or(this.page.locator('h6').filter({ hasText: 'Maintenance' }))
      .or(this.page.locator('h5').filter({ hasText: 'Administrator Access' }));
    this.claimView = this.page.getByRole('heading', { name: 'Claim' })
      .or(this.page.locator('h6').filter({ hasText: 'Claim' }));
    this.buzzView = this.page.getByRole('heading', { name: 'Buzz' })
      .or(this.page.locator('h6').filter({ hasText: 'Buzz' }));
  }

  getMenuItem(name: string): Locator {
    return this.root.locator('li.oxd-main-menu-item-wrapper a').filter({ hasText: name })
      .or(this.root.getByRole('link').filter({ hasText: name }));
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
}
