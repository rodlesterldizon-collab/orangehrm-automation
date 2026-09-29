import { Page, APIRequestContext, Locator } from '@playwright/test';
import { BasePage } from './BasePage.js';
import { EmployeeTestData } from '../utils/test-data.js';

export class PimPage extends BasePage {
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
    this.employeeListTab = page.getByRole('link', { name: 'Employee List' });
    this.addEmployeeTab = page.getByRole('link', { name: 'Add Employee' });
    this.reportsTab = page.getByRole('link', { name: 'Reports' });

    // Add Employee Form locators (SS-04)
    this.firstNameInput = page.getByPlaceholder('First Name');
    this.middleNameInput = page.getByPlaceholder('Middle Name');
    this.lastNameInput = page.getByPlaceholder('Last Name');
    this.employeeIdInput = page.locator('.oxd-input-group:has-text("Employee Id") input');
    this.createLoginDetailsToggle = page.locator('.oxd-switch-input');
    this.saveEmployeeButton = page.getByRole('button', { name: 'Save' });
    this.cancelEmployeeButton = page.getByRole('button', { name: 'Cancel' });
    this.employeeDetailsHeader = page.locator('.orangehrm-edit-employee-name');

    // Search and Table locators (SS-03)
    this.searchNameInput = page.locator('.oxd-autocomplete-text-input input').first();
    this.searchIdInput = page.locator('.oxd-input-group:has-text("Employee Id") input');
    this.searchButton = page.getByRole('button', { name: 'Search' });
    this.resetButton = page.getByRole('button', { name: 'Reset' });
    this.recordsFoundLabel = page.locator('span.oxd-text--span, .orangehrm-horizontal-padding span').filter({ hasText: /Records? Found|No Records Found/i }).first();
    this.container = page.locator('.orangehrm-container');
    this.table = page.locator('.oxd-table');
    this.tableRows = page.locator('.oxd-table-card');
    this.autocompleteDropdown = page.locator('.oxd-autocomplete-dropdown');
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
    const option = this.autocompleteDropdown.locator('.oxd-autocomplete-option').first();
    if (await option.isVisible()) {
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
