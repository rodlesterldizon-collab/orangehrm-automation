import { Page, APIRequestContext, Locator } from '@playwright/test';
import { BasePage } from './BasePage.js';

export class DirectoryPage extends BasePage {
  // Scoped Filter / Form Container (.oxd-table-filter)
  readonly filterContainer: Locator;

  // Form Fields & Buttons nested inside the Filter container
  readonly searchNameInput: Locator;
  readonly jobTitleDropdown: Locator;
  readonly locationDropdown: Locator;
  readonly searchButton: Locator;
  readonly resetButton: Locator;
  readonly recordsFoundLabel: Locator;

  // Grid & Cards Containers
  readonly cardGrid: Locator;
  readonly cardsGrid: Locator;
  readonly gridContainer: Locator;
  readonly employeeCards: Locator;

  // Dropdown Overlays
  readonly autocompleteDropdown: Locator;
  readonly autocompleteOptions: Locator;
  readonly selectDropdown: Locator;
  readonly selectOptions: Locator;

  constructor(page: Page, request: APIRequestContext) {
    super(page, request);

    // 1. Scoped Filter / Form Container
    this.filterContainer = page.locator('.oxd-table-filter');

    // 2. Chained dot-locators within the filter container
    this.searchNameInput = this.filterContainer.getByPlaceholder('Type for hints...');
    this.jobTitleDropdown = this.filterContainer.locator('.oxd-input-group').filter({ hasText: 'Job Title' }).locator('.oxd-select-text');
    this.locationDropdown = this.filterContainer.locator('.oxd-input-group').filter({ hasText: 'Location' }).locator('.oxd-select-text');
    this.searchButton = this.filterContainer.getByRole('button', { name: 'Search' });
    this.resetButton = this.filterContainer.getByRole('button', { name: 'Reset' });

    // 3. Grid & Results Counter
    this.recordsFoundLabel = page.locator('.orangehrm-horizontal-padding span, span.oxd-text--span').filter({ hasText: /Records? Found|No Records Found/i }).first();
    this.cardGrid = page.locator('.orangehrm-container');
    this.cardsGrid = page.locator('.orangehrm-container');
    this.gridContainer = page.locator('.orangehrm-container .oxd-grid-4');
    this.employeeCards = page.locator('.orangehrm-directory-card, .oxd-grid-item .oxd-sheet');

    // 4. Overlays & Select Options
    this.autocompleteDropdown = page.locator('.oxd-autocomplete-dropdown');
    this.autocompleteOptions = this.autocompleteDropdown.locator('.oxd-autocomplete-option');
    this.selectDropdown = page.locator('.oxd-select-dropdown');
    this.selectOptions = page.getByRole('option');
  }

  async navigate(): Promise<void> {
    await this.goto('/web/index.php/directory/viewDirectory');
    await this.recordsFoundLabel.waitFor({ state: 'visible', timeout: 10000 }).catch(() => null);
  }
}
