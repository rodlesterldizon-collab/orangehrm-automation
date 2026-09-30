import { Page, APIRequestContext, Locator } from '@playwright/test';
import { BasePage } from './BasePage.js';

export class DirectoryPage extends BasePage {
  // Scoped Filter / Form Container (.oxd-table-filter)
  readonly formContainer: Locator;
  readonly directoryContainer: Locator;
  // Form Fields & Buttons nested inside the Filter container
  readonly searchEmployeeInput: Locator;
  readonly jobTitleDropdown: Locator;
  readonly locationDropdown: Locator;
  readonly searchButton: Locator;
  readonly resetButton: Locator;
  readonly recordsFoundLabel: Locator;

  // Grid & Cards Containers
  readonly cardsGrid: Locator;
  readonly employeeCards: Locator;

  // Dropdown Overlays
  readonly autocompleteDropdown: Locator;
  readonly autocompleteOptions: Locator;
  readonly selectDropdown: Locator;
  readonly selectOptions: Locator;

  constructor(page: Page, request: APIRequestContext) {
    super(page, request);

    // 1. Scoped locators
    this.formContainer = page.locator('form');
    this.directoryContainer = page.locator('div[class*="corporate-directory"]');

    // 2. Chained dot-locators within the filter container
    this.searchEmployeeInput = this.formContainer.locator('input');
    this.jobTitleDropdown = this.formContainer.locator('div').filter({ hasText: 'Job Title' }).locator('div').filter({ hasText: /.+/ }).first();
    // this.searchNameInput = this.filterContainer.getByPlaceholder('Type for hints...');
    // this.jobTitleDropdown = this.filterContainer.locator('.oxd-input-group').filter({ hasText: 'Job Title' }).locator('.oxd-select-text');
    this.locationDropdown = this.formContainer.locator('div').filter({ hasText: 'Job Title' }).locator('div').filter({ hasText: /.+/ }).last();
    this.searchButton = this.formContainer.getByRole('button', { name: 'Search' });
    this.resetButton = this.formContainer.getByRole('button', { name: 'Reset' });

    // 3. Grid & Results Counter
    this.recordsFoundLabel = this.directoryContainer.locator('span').filter({ hasText: /Records? Found|No Records Found/i }).first();
    this.cardsGrid = this.directoryContainer.locator('.orangehrm-container');
    this.employeeCards = this.directoryContainer.locator('div[class*=oxd-sheet]');

    // 4. Overlays & Select Options
    this.autocompleteDropdown = page.locator('#oxd-toaster_1');
    this.autocompleteOptions = this.autocompleteDropdown.locator('.oxd-autocomplete-option');
    this.selectDropdown = page.locator('div[role="listbox"]');
    this.selectOptions = page.getByRole('option');
  }

  async navigate(): Promise<void> {
    await this.goto('/web/index.php/directory/viewDirectory');
  }
}
