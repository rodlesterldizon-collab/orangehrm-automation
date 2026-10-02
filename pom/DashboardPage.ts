import { Page, APIRequestContext, Locator } from '@playwright/test';
import { BasePage } from './BasePage.js';

export class DashboardPage extends BasePage {
  readonly root: Locator;
  readonly dashboardHeader: Locator;
  readonly quickLaunchTitle: Locator;
  readonly timeAtWorkTitle: Locator;
  readonly timeAtWorkIcon: Locator;
  readonly myActionsWidget: Locator;
  readonly myActionsTitle: Locator;
  readonly myActionsIcon: Locator;
  readonly buzzWidget: Locator;
  readonly employeesOnLeaveWidget: Locator;
  readonly employeeDistributionSubUnitWidget: Locator;
  readonly employeeDistributionLocationWidget: Locator;
  readonly allWidgets: Locator;
  readonly timeAtWorkCardBody: Locator;
  readonly myActionsCardBody: Locator;
  readonly assignLeaveButton: Locator;
  readonly leaveListButton: Locator;
  readonly timesheetsButton: Locator;
  readonly applyLeaveButton: Locator;
  readonly myLeaveButton: Locator;
  readonly myTimesheetButton: Locator;

  constructor(page: Page, request: APIRequestContext) {
    super(page, request);
    this.root = this.page.locator('[class*="layout-context"]');
    this.dashboardHeader = this.page.locator('header').getByText('Dashboard');

    // Core dashboard widget cards
    this.allWidgets = this.page.locator('[class*="dashboard-widget-header"]');
    this.quickLaunchTitle = this.allWidgets.filter({ hasText: 'Quick Launch' });
    this.timeAtWorkTitle = this.allWidgets.filter({ hasText: 'Time at Work' });
    this.timeAtWorkIcon = this.timeAtWorkTitle.locator('i.bi-clock-fill').first();
    this.timeAtWorkCardBody = this.timeAtWorkTitle;

    this.myActionsWidget = this.allWidgets.filter({ hasText: 'My Actions' }).first();
    this.myActionsTitle = this.myActionsWidget.locator('p').filter({ hasText: 'My Actions' }).first();
    this.myActionsIcon = this.myActionsWidget.locator('i.bi-list-check').first();
    this.myActionsCardBody = this.myActionsTitle;
    this.buzzWidget = this.page.locator('.orangehrm-dashboard-widget').filter({ hasText: 'Buzz Latest Posts' }).first();
    this.employeesOnLeaveWidget = this.page.locator('.orangehrm-dashboard-widget').filter({ hasText: 'Employees on Leave Today' }).first();
    this.employeeDistributionSubUnitWidget = this.page.locator('.orangehrm-dashboard-widget').filter({ hasText: 'Employee Distribution by Sub Unit' }).first();
    this.employeeDistributionLocationWidget = this.page.locator('.orangehrm-dashboard-widget').filter({ hasText: 'Employee Distribution by Location' }).first();

    // Quick Launch navigation shortcuts
    this.assignLeaveButton = this.page.getByRole('button', { name: 'Assign Leave' }).or(this.page.locator('button[title*="Assign Leave"]'));
    this.leaveListButton = this.page.getByRole('button', { name: 'Leave List' }).or(this.page.locator('button[title*="Leave List"]'));
    this.timesheetsButton = this.page.getByRole('button', { name: 'Timesheets' }).or(this.page.locator('button[title*="Timesheets"]'));
    this.applyLeaveButton = this.page.getByRole('button', { name: 'Apply Leave' }).or(this.page.locator('button[title*="Apply Leave"]'));
    this.myLeaveButton = this.page.getByRole('button', { name: 'My Leave' }).or(this.page.locator('button[title*="My Leave"]'));
    this.myTimesheetButton = this.page.getByRole('button', { name: 'My Timesheet' }).or(this.page.locator('button[title*="My Timesheet"]'));
  }

  async navigate(): Promise<void> {
    await this.goto('/web/index.php/dashboard/index');
    await this.waitForSpinner();
  }

  async clickAssignLeave(): Promise<void> {
    await this.assignLeaveButton.click();
    await this.waitForSpinner();
  }

  async clickTimesheets(): Promise<void> {
    await this.timesheetsButton.click();
    await this.waitForSpinner();
  }

  async clickApplyLeave(): Promise<void> {
    await this.applyLeaveButton.click();
    await this.waitForSpinner();
  }

  async clickMyLeave(): Promise<void> {
    await this.myLeaveButton.click();
    await this.waitForSpinner();
  }

  async clickMyTimesheet(): Promise<void> {
    await this.myTimesheetButton.click();
    await this.waitForSpinner();
  }

  async getWidgetCount(): Promise<number> {
    return await this.allWidgets.count();
  }
}
