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
  readonly tableHeadings: Locator;
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
    //Apply Fallback locators to ensure less flaky tests using .or() and .filter()
    // 1. Containers for scoped queries (prevents locator ambiguity between search and form)
    this.filterContainer = page.locator('[class$="table-filter"]').first().or(page.locator('.oxd-table-filter')).first();
    this.userFormContainer = page.locator('form').or(page.locator('.orangehrm-card-container'));

    // 2. Search Filter Form
    this.addUserButton = page.getByRole('button', { name: 'Add' });
    this.searchUsernameInput = this.filterContainer.locator('input[placeholder="Username"]')
      .or(this.filterContainer.locator('.oxd-input-group:has-text("Username") input'));
    this.searchUserRoleDropdown = this.filterContainer.getByLabel('User Role')
      .or(this.filterContainer.locator('.oxd-input-group:has-text("User Role") .oxd-select-text'));
    this.searchEmployeeNameInput = this.filterContainer.locator('input[placeholder="Type for hints"]')
      .or(this.filterContainer.locator('.oxd-autocomplete-text-input input'));
    this.searchStatusDropdown = this.filterContainer.getByLabel('Status')
      .or(this.filterContainer.locator('.oxd-input-group:has-text("Status") .oxd-select-text'));
    this.searchButton = this.filterContainer.getByRole('button', { name: 'Search' });
    this.resetButton = this.filterContainer.getByRole('button', { name: 'Reset' });
    this.recordsFoundLabel = page.locator('span').filter({ hasText: /Records? Found/i }).first();

    // 3. Table & Row Scoping
    this.tableHeadings = page.locator('div[role="rowgroup"]').first();
    this.table = page.locator('div[role="rowgroup"]');
    this.tableRows = this.table.locator('div[role="row"]');
    this.userRoleCells = this.table.locator('div[class$="-cell"]').nth(2)
      .or(this.tableRows.locator('.oxd-table-cell:nth-child(3)'));

    // 4. Add User Form Fields (scoped inside userFormContainer)
    this.userRoleSelect = this.userFormContainer.locator('i').first()
      .or(this.userFormContainer.locator('.oxd-input-group:has-text("User Role") .oxd-select-text')).first();
    this.employeeNameAutocomplete = this.userFormContainer.locator('input[placeholder="Type for hints"]').first()
      .or(this.userFormContainer.locator('.oxd-autocomplete-text-input input'));
    this.statusSelect = this.userFormContainer.locator('i').last()
      .or(this.userFormContainer.locator('.oxd-input-group:has-text("Status") .oxd-select-text')).first();
    this.usernameInput = this.userFormContainer.getByRole('textbox').nth(1)
      .or(this.userFormContainer.locator('.oxd-input-group:has-text("Username") input'));
    this.passwordInput = this.userFormContainer.locator('input[type="password"]').first();
    this.confirmPasswordInput = this.userFormContainer.locator('input[type="password"]').last();
    this.saveUserButton = this.userFormContainer.getByRole('button', { name: 'Save' });
    this.cancelUserButton = this.userFormContainer.getByRole('button', { name: 'Cancel' });
    this.alreadyExistsError = page.locator('span').filter({ hasText: /Already exists/i });
    this.autocompleteDropdown = page.locator('div[class*="autocomplete-dropdown"]');
  }

  async navigate(): Promise<void> {
    await this.goto('/web/index.php/admin/viewSystemUsers');
  }
}
