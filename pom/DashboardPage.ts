import { Page, APIRequestContext, Locator } from '@playwright/test';
import { BasePage } from './BasePage.js';

export class DashboardPage extends BasePage {
  readonly dashboardHeader: Locator;
  readonly quickLaunchWidget: Locator;
  readonly timeAtWorkWidget: Locator;
  readonly myActionsWidget: Locator;
  readonly assignLeaveButton: Locator;
  readonly leaveListButton: Locator;
  readonly timesheetsButton: Locator;

  constructor(page: Page, request: APIRequestContext) {
    super(page, request);
    this.dashboardHeader = page.locator('.oxd-topbar-header-breadcrumb').getByText('Dashboard');
    this.quickLaunchWidget = page.locator('.oxd-sheet').filter({ hasText: 'Quick Launch' });
    this.timeAtWorkWidget = page.locator('.oxd-sheet').filter({ hasText: 'Time at Work' });
    this.myActionsWidget = page.locator('.oxd-sheet').filter({ hasText: 'My Actions' });
    this.assignLeaveButton = page.getByRole('button', { name: 'Assign Leave' });
    this.leaveListButton = page.getByRole('button', { name: 'Leave List' });
    this.timesheetsButton = page.getByRole('button', { name: 'Timesheets' });
  }

  async navigate(): Promise<void> {
    await this.goto('/web/index.php/dashboard/index');
  }

  async clickQuickLaunch(name: string): Promise<void> {
    await this.quickLaunchWidget.getByRole('button', { name }).click();
  }
}
