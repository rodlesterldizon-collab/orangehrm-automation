import { Page, APIRequestContext, Locator } from '@playwright/test';
import { BasePage } from './BasePage.js';

export class DashboardPage extends BasePage {
  readonly root: Locator;
  readonly dashboardHeader: Locator;
  readonly quickLaunchWidget: Locator;
  readonly timeAtWorkWidget: Locator;
  readonly myActionsWidget: Locator;
  readonly buzzWidget: Locator;
  readonly employeesOnLeaveWidget: Locator;
  readonly employeeDistributionSubUnitWidget: Locator;
  readonly employeeDistributionLocationWidget: Locator;
  readonly allWidgets: Locator;
  readonly breadcrumb: Locator;
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
    this.breadcrumb = this.page.locator('.oxd-topbar-header-breadcrumb, .oxd-topbar-header-title').first();
    
    // Core dashboard widget cards
    this.allWidgets = this.page.locator('.orangehrm-dashboard-widget, .oxd-sheet--white');
    this.quickLaunchWidget = this.page.locator('.orangehrm-dashboard-widget').filter({ hasText: 'Quick Launch' }).first();
    this.timeAtWorkWidget = this.page.locator('.orangehrm-dashboard-widget').filter({ hasText: 'Time at Work' }).first();
    this.timeAtWorkCardBody = this.timeAtWorkWidget.locator('.orangehrm-dashboard-widget-body, .oxd-sheet').first();
    this.myActionsWidget = this.page.locator('.orangehrm-dashboard-widget').filter({ hasText: 'My Actions' }).first();
    this.myActionsCardBody = this.myActionsWidget.locator('.orangehrm-dashboard-widget-body, .oxd-sheet').first();
    this.buzzWidget = this.page.locator('.orangehrm-dashboard-widget').filter({ hasText: 'Buzz Latest Posts' }).first();
    this.employeesOnLeaveWidget = this.page.locator('.orangehrm-dashboard-widget').filter({ hasText: 'Employees on Leave Today' }).first();
    this.employeeDistributionSubUnitWidget = this.page.locator('.orangehrm-dashboard-widget').filter({ hasText: 'Employee Distribution by Sub Unit' }).first();
    this.employeeDistributionLocationWidget = this.page.locator('.orangehrm-dashboard-widget').filter({ hasText: 'Employee Distribution by Location' }).first();

    // Quick Launch navigation shortcuts
    this.assignLeaveButton = this.quickLaunchWidget.getByRole('button', { name: 'Assign Leave' }).or(this.quickLaunchWidget.locator('button[title*="Assign Leave"]'));
    this.leaveListButton = this.quickLaunchWidget.getByRole('button', { name: 'Leave List' }).or(this.quickLaunchWidget.locator('button[title*="Leave List"]'));
    this.timesheetsButton = this.quickLaunchWidget.getByRole('button', { name: 'Timesheets' }).or(this.quickLaunchWidget.locator('button[title*="Timesheets"]'));
    this.applyLeaveButton = this.quickLaunchWidget.getByRole('button', { name: 'Apply Leave' }).or(this.quickLaunchWidget.locator('button[title*="Apply Leave"]'));
    this.myLeaveButton = this.quickLaunchWidget.getByRole('button', { name: 'My Leave' }).or(this.quickLaunchWidget.locator('button[title*="My Leave"]'));
    this.myTimesheetButton = this.quickLaunchWidget.getByRole('button', { name: 'My Timesheet' }).or(this.quickLaunchWidget.locator('button[title*="My Timesheet"]'));
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
