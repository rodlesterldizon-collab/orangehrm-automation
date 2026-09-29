import { Page, APIRequestContext, Locator } from '@playwright/test';
import { BasePage } from './BasePage.js';
import { EmployeeTestData } from '../utils/test-data.js';

export class PimPage extends BasePage {
  readonly root: Locator;
  readonly filterForm: Locator;
  readonly addEmployeeForm: Locator;

  // Navigation tabs
  readonly employeeListTab: Locator;
  readonly addEmployeeTab: Locator;
  readonly reportsTab: Locator;

  // Add Employee Form
  readonly firstNameInput: Locator;
  readonly middleNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly employeeIdInput: Locator;
  readonly createLoginDetailsToggle: Locator;
  readonly saveEmployeeButton: Locator;
  readonly cancelEmployeeButton: Locator;
  readonly employeeDetailsHeader: Locator;

  // Employee List Search Form & Table
  readonly searchNameInput: Locator;
  readonly searchIdInput: Locator;
  readonly searchButton: Locator;
  readonly resetButton: Locator;
  readonly recordsFoundLabel: Locator;
  readonly container: Locator;
  readonly table: Locator;
  readonly tableRows: Locator;
  readonly autocompleteDropdown: Locator;

  constructor(page: Page, request: APIRequestContext) {
    super(page, request);
    this.root = this.page.getByRole('main');
    this.filterForm = this.root.locator('form').first();
    this.addEmployeeForm = this.root.locator('form').last();

    this.employeeListTab = this.page.getByRole('link', { name: 'Employee List' });
    this.addEmployeeTab = this.page.getByRole('link', { name: 'Add Employee' });
    this.reportsTab = this.page.getByRole('link', { name: 'Reports' });

    // Add Employee Form locators (SS-04)
    this.firstNameInput = this.addEmployeeForm.getByPlaceholder('First Name');
    this.middleNameInput = this.addEmployeeForm.getByPlaceholder('Middle Name');
    this.lastNameInput = this.addEmployeeForm.getByPlaceholder('Last Name');
    this.employeeIdInput = this.addEmployeeForm.locator('div').filter({ has: this.page.getByText('Employee Id', { exact: true }) }).locator('input');
    this.createLoginDetailsToggle = this.addEmployeeForm.locator('input[type="checkbox"], .oxd-switch-input');
    this.saveEmployeeButton = this.addEmployeeForm.getByRole('button', { name: 'Save', exact: true });
    this.cancelEmployeeButton = this.addEmployeeForm.getByRole('button', { name: 'Cancel', exact: true });
    this.employeeDetailsHeader = this.root.locator('h6').first();

    // Search and Table locators (SS-03)
    this.searchNameInput = this.filterForm.getByPlaceholder('Type for hints...').first();
    this.searchIdInput = this.filterForm.locator('div').filter({ has: this.page.getByText('Employee Id', { exact: true }) }).locator('input');
    this.searchButton = this.filterForm.getByRole('button', { name: 'Search', exact: true });
    this.resetButton = this.filterForm.getByRole('button', { name: 'Reset', exact: true });
    this.recordsFoundLabel = this.root.getByText(/Records? Found|No Records Found/i).first();
    this.container = this.root.locator('.orangehrm-container, [role="table"]');
    this.table = this.root.locator('.oxd-table, [role="table"]');
    this.tableRows = this.table.locator('.oxd-table-card, [role="row"]');
    this.autocompleteDropdown = this.page.locator('[role="listbox"], .oxd-autocomplete-dropdown');
  }

  async navigateToList(): Promise<void> {
    await this.goto('/web/index.php/pim/viewEmployeeList');
  }

  async navigateToAdd(): Promise<void> {
    await this.goto('/web/index.php/pim/addEmployee');
  }

  async fillAddEmployeeForm(data: EmployeeTestData, customId = false): Promise<void> {
    await this.firstNameInput.fill(data.firstName);
    if (data.middleName) {
      await this.middleNameInput.fill(data.middleName);
    }
    await this.lastNameInput.fill(data.lastName);
    if (customId && data.employeeId) {
      await this.employeeIdInput.click();
      await this.employeeIdInput.fill('');
      await this.employeeIdInput.fill(data.employeeId);
    }
  }

  async saveEmployee(): Promise<void> {
    await this.saveEmployeeButton.click();
  }

  async searchByName(name: string): Promise<void> {
    await this.searchNameInput.fill(name);
    // Wait for autocomplete debouncing
    await this.autocompleteDropdown.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    const option = this.autocompleteDropdown.locator('.oxd-autocomplete-option, [role="option"]').first();
    if (await option.isVisible().catch(() => false)) {
      await option.click();
    }
    await this.searchButton.click();
  }

  async searchById(id: string): Promise<void> {
    await this.searchIdInput.fill(id);
    await this.searchButton.click();
  }

  async resetSearch(): Promise<void> {
    await this.resetButton.click();
  }
}
