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
  readonly employeeCards: Locator;
  readonly autocompleteDropdown: Locator;

  constructor(page: Page, request: APIRequestContext) {
    super(page, request);
    this.searchNameInput = page.getByPlaceholder('Type for hints...');
    this.jobTitleDropdown = page.locator('.oxd-input-group:has-text("Job Title") .oxd-select-text');
    this.locationDropdown = page.locator('.oxd-input-group:has-text("Location") .oxd-select-text');
    this.searchButton = page.getByRole('button', { name: 'Search' });
    this.resetButton = page.getByRole('button', { name: 'Reset' });
    this.recordsFoundLabel = page.locator('.orangehrm-horizontal-padding span').first();
    this.cardGrid = page.locator('.orangehrm-container');
    this.cardsGrid = page.locator('.orangehrm-container');
    this.employeeCards = page.locator('.oxd-sheet');
    this.autocompleteDropdown = page.locator('.oxd-autocomplete-dropdown');
  }

  async navigate(): Promise<void> {
    await this.goto('/web/index.php/directory/viewDirectory');
  }

  async searchByName(name: string): Promise<void> {
    await this.searchNameInput.fill(name);
    await this.autocompleteDropdown.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    const option = this.autocompleteDropdown.locator('.oxd-autocomplete-option').first();
    if (await option.isVisible()) {
      await option.click();
    }
    await this.searchButton.click();
  }

  async filterByJobTitle(title: string): Promise<void> {
    await this.jobTitleDropdown.click();
    await this.page.getByRole('option', { name: title }).click();
    await this.searchButton.click();
  }

  async reset(): Promise<void> {
    await this.resetButton.click();
  }
}
