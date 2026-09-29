import { Page, APIRequestContext, Locator } from '@playwright/test';
import { BasePage } from './BasePage.js';
import { UserTestData } from '../utils/test-data.js';

export class AdminPage extends BasePage {
  readonly root: Locator;
  readonly filterForm: Locator;
  readonly addUserForm: Locator;

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
    this.root = this.page.getByRole('main');
    this.filterForm = this.root.locator('form').first();
    this.addUserForm = this.root.locator('form').last();

    // Search form & list
    this.addUserButton = this.root.getByRole('button', { name: 'Add', exact: true });
    this.searchUsernameInput = this.filterForm.locator('div').filter({ has: this.page.getByText('Username', { exact: true }) }).locator('input');
    this.searchUserRoleDropdown = this.filterForm
      .locator('div')
      .filter({ has: this.page.getByText('User Role', { exact: true }) })
      .locator('[role="combobox"]')
      .or(
        this.filterForm
          .locator('div')
          .filter({ has: this.page.getByText('User Role', { exact: true }) })
          .locator('i')
          .locator('..')
      )
      .first();

    this.searchEmployeeNameInput = this.filterForm.getByPlaceholder('Type for hints...');
    this.searchStatusDropdown = this.filterForm
      .locator('div')
      .filter({ has: this.page.getByText('Status', { exact: true }) })
      .locator('[role="combobox"]')
      .or(
        this.filterForm
          .locator('div')
          .filter({ has: this.page.getByText('Status', { exact: true }) })
          .locator('i')
          .locator('..')
      )
      .first();

    this.searchButton = this.filterForm.getByRole('button', { name: 'Search', exact: true });
    this.resetButton = this.filterForm.getByRole('button', { name: 'Reset', exact: true });
    this.recordsFoundLabel = this.root.getByText(/Records? Found|No Records Found/i).first();
    this.table = this.root.locator('[role="table"]').or(this.root.locator('table'));
    this.tableRows = this.root.getByRole('row').or(this.root.locator('.oxd-table-card'));

    // Add User Form
    this.userRoleSelect = this.addUserForm
      .locator('div')
      .filter({ has: this.page.getByText('User Role', { exact: true }) })
      .locator('[role="combobox"]')
      .or(
        this.addUserForm
          .locator('div')
          .filter({ has: this.page.getByText('User Role', { exact: true }) })
          .locator('i')
          .locator('..')
      )
      .first();

    this.employeeNameAutocomplete = this.addUserForm.getByPlaceholder('Type for hints...');
    this.statusSelect = this.addUserForm
      .locator('div')
      .filter({ has: this.page.getByText('Status', { exact: true }) })
      .locator('[role="combobox"]')
      .or(
        this.addUserForm
          .locator('div')
          .filter({ has: this.page.getByText('Status', { exact: true }) })
          .locator('i')
          .locator('..')
      )
      .first();

    this.usernameInput = this.addUserForm.locator('div').filter({ has: this.page.getByText('Username', { exact: true }) }).locator('input');
    this.passwordInput = this.addUserForm.locator('input[type="password"]').first();
    this.confirmPasswordInput = this.addUserForm.locator('input[type="password"]').last();
    this.saveUserButton = this.addUserForm.getByRole('button', { name: 'Save', exact: true });
    this.cancelUserButton = this.addUserForm.getByRole('button', { name: 'Cancel', exact: true });
    this.alreadyExistsError = this.addUserForm.getByText('Already exists');
    this.autocompleteDropdown = this.page.getByRole('listbox');
  }

  async navigate(): Promise<void> {
    await this.goto('/web/index.php/admin/viewSystemUsers');
    await this.recordsFoundLabel.waitFor({ state: 'visible', timeout: 10000 }).catch(() => null);
  }

  async filterByRole(role: 'Admin' | 'ESS'): Promise<void> {
    await this.searchUserRoleDropdown.click();
    await this.page.getByRole('option', { name: role }).click();
    const searchPromise = this.page.waitForResponse(
      (res) => res.url().includes('/api/v2/admin/users') && res.status() === 200,
      { timeout: 10000 }
    ).catch(() => null);
    await this.searchButton.click();
    await searchPromise;
    await this.tableRows.first().waitFor({ state: 'visible', timeout: 10000 }).catch(() => null);
  }

  async openAddUser(): Promise<void> {
    await this.addUserButton.click();
    await this.saveUserButton.waitFor({ state: 'visible', timeout: 10000 });
  }

  async createUser(data: UserTestData, employeeHint = 'a'): Promise<void> {
    // Select Role
    await this.userRoleSelect.click();
    await this.page.getByRole('option', { name: data.role }).click();

    // Type Employee Name autocomplete and select genuine non-loading option
    await this.employeeNameAutocomplete.fill(employeeHint);
    await this.autocompleteDropdown.waitFor({ state: 'visible', timeout: 6000 });
    const validOption = this.autocompleteDropdown.getByRole('option').filter({ hasNotText: 'Searching' }).first();
    await validOption.waitFor({ state: 'visible', timeout: 8000 });
    await validOption.click();

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
