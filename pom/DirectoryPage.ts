import { Page, APIRequestContext, Locator } from '@playwright/test';
import { BasePage } from './BasePage.js';

export class DirectoryPage extends BasePage {
  readonly searchNameInput: Locator;
  readonly jobTitleDropdown: Locator;
  readonly locationDropdown: Locator;
  readonly searchButton: Locator;
  readonly resetButton: Locator;
  readonly recordsFoundLabel: Locator;
  readonly cardGrid: Locator;
  readonly cardsGrid: Locator;
  readonly gridContainer: Locator;
  readonly employeeCards: Locator;
  readonly autocompleteDropdown: Locator;
  readonly autocompleteOptions: Locator;
  readonly selectDropdown: Locator;
  readonly selectOptions: Locator;
  readonly loadingSpinner: Locator;

  constructor(page: Page, request: APIRequestContext) {
    super(page, request);
    this.searchNameInput = page.getByPlaceholder('Type for hints...');
    this.jobTitleDropdown = page.locator('.oxd-input-group:has-text("Job Title") .oxd-select-text');
    this.locationDropdown = page.locator('.oxd-input-group:has-text("Location") .oxd-select-text');
    this.searchButton = page.getByRole('button', { name: 'Search' });
    this.resetButton = page.getByRole('button', { name: 'Reset' });
    this.recordsFoundLabel = page.locator('span.oxd-text--span, .orangehrm-horizontal-padding span').filter({ hasText: /Records? Found|No Records Found/i }).first();
    this.cardGrid = page.locator('.oxd-grid-4, .orangehrm-container');
    this.cardsGrid = page.locator('.oxd-grid-4, .orangehrm-container');
    this.gridContainer = page.locator('.oxd-grid-4');
    this.employeeCards = page.locator('.orangehrm-directory-card, .oxd-grid-item .oxd-sheet, .oxd-sheet');
    this.autocompleteDropdown = page.locator('.oxd-autocomplete-dropdown');
    this.autocompleteOptions = page.locator('.oxd-autocomplete-option');
    this.selectDropdown = page.locator('.oxd-select-dropdown');
    this.selectOptions = page.locator('.oxd-select-option');
    this.loadingSpinner = page.locator('.oxd-loading-spinner');
  }

  async navigate(): Promise<void> {
    await this.goto('/web/index.php/directory/viewDirectory');
    await this.recordsFoundLabel.waitFor({ state: 'visible', timeout: 10000 }).catch(() => null);
  }
}
