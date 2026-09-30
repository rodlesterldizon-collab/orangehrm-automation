import { Page, APIRequestContext, Locator } from '@playwright/test';
import { BasePage } from './BasePage.js';

export class DashboardPage extends BasePage {
  readonly root: Locator;
  readonly dashboardHeader: Locator;
  readonly quickLaunchWidget: Locator;
  readonly timeAtWorkWidget: Locator;
  readonly myActionsWidget: Locator;
  readonly assignLeaveButton: Locator;
  readonly leaveListButton: Locator;
  readonly timesheetsButton: Locator;

  constructor(page: Page, request: APIRequestContext) {
    super(page, request);
    // this.page.getByRole('main');
    this.root = this.page.locator('[class*="layout-context"]');
    this.dashboardHeader = this.page.locator('header').getByText('Dashboard');
    this.quickLaunchWidget = this.root.locator('div').filter({ has: this.page.getByText('Quick Launch', { exact: true }) }).first();
    this.timeAtWorkWidget = this.root.locator('div').filter({ has: this.page.getByText('Time at Work', { exact: true }) }).first();
    this.myActionsWidget = this.root.locator('div').filter({ has: this.page.getByText('My Actions', { exact: true }) }).first();
    this.assignLeaveButton = this.quickLaunchWidget.getByRole('button', { name: 'Assign Leave' });
    this.leaveListButton = this.quickLaunchWidget.getByRole('button', { name: 'Leave List' });
    this.timesheetsButton = this.quickLaunchWidget.getByRole('button', { name: 'Timesheets' });
  }

  async navigate(): Promise<void> {
    await this.goto('/web/index.php/dashboard/index');
  }
}
