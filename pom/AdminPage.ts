import { Page, APIRequestContext, Locator } from '@playwright/test';
import { BasePage } from './BasePage.js';

export class AdminPage extends BasePage {
  // Scoped Form Containers
  readonly filterContainer: Locator;
  readonly userFormContainer: Locator;

  // Search Filter Form Locators
  readonly addUserButton: Locator;
  readonly searchUsernameInput: Locator;
  readonly searchUserRoleDropdown: Locator;
  readonly searchEmployeeNameInput: Locator;
  readonly searchStatusDropdown: Locator;
  readonly searchButton: Locator;
  readonly resetButton: Locator;
  readonly recordsFoundLabel: Locator;

  // Table & Results Grid
  readonly table: Locator;
  readonly tableRows: Locator;
  readonly userRoleCells: Locator;

  // Add/Edit User Form Locators
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

    // 1. Containers for scoped queries (prevents locator ambiguity between search and form)
    this.filterContainer = page.locator('.oxd-table-filter');
    this.userFormContainer = page.locator('.orangehrm-card-container');

    // 2. Search Filter Form
    this.addUserButton = page.getByRole('button', { name: 'Add' });
    this.searchUsernameInput = this.filterContainer.locator('.oxd-input-group:has-text("Username") input');
    this.searchUserRoleDropdown = this.filterContainer.locator('.oxd-input-group:has-text("User Role") .oxd-select-text');
    this.searchEmployeeNameInput = this.filterContainer.locator('.oxd-autocomplete-text-input input');
    this.searchStatusDropdown = this.filterContainer.locator('.oxd-input-group:has-text("Status") .oxd-select-text');
    this.searchButton = this.filterContainer.getByRole('button', { name: 'Search' });
    this.resetButton = this.filterContainer.getByRole('button', { name: 'Reset' });
    this.recordsFoundLabel = page.locator('.orangehrm-horizontal-padding span, span.oxd-text--span').filter({ hasText: /Records? Found/i }).first();

    // 3. Table & Row Scoping
    this.table = page.locator('.oxd-table');
    this.tableRows = page.locator('.oxd-table-card');
    this.userRoleCells = this.tableRows.locator('.oxd-table-cell:nth-child(3)');

    // 4. Add User Form Fields (scoped inside userFormContainer)
    this.userRoleSelect = this.userFormContainer.locator('.oxd-input-group:has-text("User Role") .oxd-select-text');
    this.employeeNameAutocomplete = this.userFormContainer.locator('.oxd-autocomplete-text-input input');
    this.statusSelect = this.userFormContainer.locator('.oxd-input-group:has-text("Status") .oxd-select-text');
    this.usernameInput = this.userFormContainer.locator('.oxd-input-group:has-text("Username") input');
    this.passwordInput = this.userFormContainer.locator('.oxd-input-group:has-text("Password") input[type="password"]').first();
    this.confirmPasswordInput = this.userFormContainer.locator('.oxd-input-group:has-text("Confirm Password") input[type="password"]');
    this.saveUserButton = this.userFormContainer.getByRole('button', { name: 'Save' });
    this.cancelUserButton = this.userFormContainer.getByRole('button', { name: 'Cancel' });
    this.alreadyExistsError = page.locator('.oxd-input-field-error-message').filter({ hasText: /Already exists/i });
    this.autocompleteDropdown = page.locator('.oxd-autocomplete-dropdown');
  }

  async navigate(): Promise<void> {
    await this.goto('/web/index.php/admin/viewSystemUsers');
  }
}
