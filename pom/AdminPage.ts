import { Page, APIRequestContext, Locator } from '@playwright/test';
import { BasePage } from './BasePage.js';
import { UserTestData } from '../utils/test-data.js';

export class AdminPage extends BasePage {
  // System Users List view (SS-02)
  readonly addUserButton: Locator;
  readonly searchUsernameInput: Locator;
  readonly searchUserRoleDropdown: Locator;
  readonly searchEmployeeNameInput: Locator;
  readonly searchStatusDropdown: Locator;
  readonly searchButton: Locator;
  readonly resetButton: Locator;
  readonly recordsFoundLabel: Locator;
  readonly table: Locator;
  readonly tableRows: Locator;

  // Add User Form locators
  readonly userRoleSelect: Locator;
  readonly employeeNameAutocomplete: Locator;
  readonly statusSelect: Locator;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly saveUserButton: Locator;
  readonly cancelUserButton: Locator;
  readonly alreadyExistsError: Locator;
  readonly autocompleteDropdown: Locator;

  constructor(page: Page, request: APIRequestContext) {
    super(page, request);
    // Search form & list
    this.addUserButton = page.getByRole('button', { name: 'Add' });
    this.searchUsernameInput = page.locator('.oxd-input-group:has-text("Username") input');
    this.searchUserRoleDropdown = page.locator('.oxd-input-group:has-text("User Role") .oxd-select-text');
    this.searchEmployeeNameInput = page.locator('.oxd-autocomplete-text-input input');
    this.searchStatusDropdown = page.locator('.oxd-input-group:has-text("Status") .oxd-select-text');
    this.searchButton = page.getByRole('button', { name: 'Search' });
    this.resetButton = page.getByRole('button', { name: 'Reset' });
    this.recordsFoundLabel = page.locator('.orangehrm-horizontal-padding span').first();
    this.table = page.locator('.oxd-table');
    this.tableRows = page.locator('.oxd-table-card');

    // Add User Form
    this.userRoleSelect = page.locator('.oxd-input-group:has-text("User Role") .oxd-select-text');
    this.employeeNameAutocomplete = page.locator('.oxd-autocomplete-text-input input');
    this.statusSelect = page.locator('.oxd-input-group:has-text("Status") .oxd-select-text');
    this.usernameInput = page.locator('.oxd-input-group:has-text("Username") input');
    this.passwordInput = page.locator('.oxd-input-group:has-text("Password") input[type="password"]').first();
    this.confirmPasswordInput = page.locator('.oxd-input-group:has-text("Confirm Password") input[type="password"]');
    this.saveUserButton = page.getByRole('button', { name: 'Save' });
    this.cancelUserButton = page.getByRole('button', { name: 'Cancel' });
    this.alreadyExistsError = page.locator('.oxd-input-field-error-message:has-text("Already exists")');
    this.autocompleteDropdown = page.locator('.oxd-autocomplete-dropdown');
  }

  async navigate(): Promise<void> {
    await this.goto('/web/index.php/admin/viewSystemUsers');
  }

  async filterByRole(role: 'Admin' | 'ESS'): Promise<void> {
    await this.searchUserRoleDropdown.click();
    await this.page.getByRole('option', { name: role }).click();
    await this.searchButton.click();
  }

  async openAddUser(): Promise<void> {
    await this.addUserButton.click();
  }

  async createUser(data: UserTestData, employeeHint = 'a'): Promise<void> {
    // Select Role
    await this.userRoleSelect.click();
    await this.page.getByRole('option', { name: data.role }).click();

    // Type Employee Name autocomplete
    await this.employeeNameAutocomplete.fill(employeeHint);
    await this.autocompleteDropdown.waitFor({ state: 'visible', timeout: 5000 });
    await this.autocompleteDropdown.locator('.oxd-autocomplete-option').first().click();

    // Select Status
    await this.statusSelect.click();
    await this.page.getByRole('option', { name: data.status }).click();

    // Enter Username & Password
    await this.usernameInput.fill(data.username);
    await this.passwordInput.fill(data.password);
    await this.confirmPasswordInput.fill(data.password);

    await this.saveUserButton.click();
  }
}
