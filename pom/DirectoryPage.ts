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
    this.recordsFoundLabel = page.locator('span').filter({ hasText: /Records? Found|No Records Found/i }).first();
    this.cardGrid = page.locator('.orangehrm-container');
    this.cardsGrid = page.locator('.orangehrm-container');
    this.employeeCards = page.locator('.orangehrm-directory-card, .oxd-sheet');
    this.autocompleteDropdown = page.locator('.oxd-autocomplete-dropdown');
  }

  async navigate(): Promise<void> {
    await this.goto('/web/index.php/directory/viewDirectory');
    await this.recordsFoundLabel.waitFor({ state: 'visible', timeout: 10000 }).catch(() => null);
  }

  async searchByName(name: string): Promise<void> {
    await this.searchNameInput.fill(name);
    await this.autocompleteDropdown.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    const option = this.autocompleteDropdown.locator('.oxd-autocomplete-option:not(:has-text("Searching"))').first();
    if (await option.isVisible().catch(() => false)) {
      await option.click();
    }
    const searchPromise = this.page.waitForResponse(
      (res) => res.url().includes('/api/v2/directory/employees'),
      { timeout: 8000 }
    ).catch(() => null);
    await this.searchButton.click();
    await searchPromise;
  }

  async filterByJobTitle(title?: string): Promise<string> {
    await this.jobTitleDropdown.click();
    await this.page.locator('.oxd-select-dropdown').waitFor({ state: 'visible', timeout: 5000 });
    
    let selectedText = title || '';
    if (title) {
      const match = this.page.locator(`.oxd-select-dropdown .oxd-select-option:has-text("${title}")`);
      if (await match.count() > 0) {
        selectedText = (await match.first().textContent())?.trim() || title;
        await match.first().click();
      } else {
        const option = this.page.locator('.oxd-select-dropdown .oxd-select-option:not(:has-text("-- Select --"))').first();
        selectedText = (await option.textContent())?.trim() || '';
        await option.click();
      }
    } else {
      const option = this.page.locator('.oxd-select-dropdown .oxd-select-option:not(:has-text("-- Select --"))').first();
      selectedText = (await option.textContent())?.trim() || '';
      await option.click();
    }

    const responsePromise = this.page.waitForResponse(
      (res) => res.url().includes('/api/v2/directory/employees'),
      { timeout: 8000 }
    ).catch(() => null);
    await this.searchButton.click();
    await responsePromise;
    await this.recordsFoundLabel.waitFor({ state: 'visible', timeout: 8000 }).catch(() => null);
    return selectedText;
  }

  async filterByJobTitleAndLocation(jobTitle: string, location: string): Promise<void> {
    // 1. Select Job Title
    await this.jobTitleDropdown.click();
    await this.page.locator('.oxd-select-dropdown').waitFor({ state: 'visible', timeout: 5000 });
    const jobOption = this.page.locator(`.oxd-select-dropdown .oxd-select-option:has-text("${jobTitle}")`);
    if (await jobOption.count() > 0) {
      await jobOption.first().click();
    } else {
      await this.page.locator('.oxd-select-dropdown .oxd-select-option:not(:has-text("-- Select --"))').first().click();
    }

    // 2. Select Location
    await this.locationDropdown.click();
    await this.page.locator('.oxd-select-dropdown').waitFor({ state: 'visible', timeout: 5000 });
    const locOption = this.page.locator(`.oxd-select-dropdown .oxd-select-option:has-text("${location}")`);
    if (await locOption.count() > 0) {
      await locOption.first().click();
    } else {
      await this.page.locator('.oxd-select-dropdown .oxd-select-option:not(:has-text("-- Select --"))').first().click();
    }

    const responsePromise = this.page.waitForResponse(
      (res) => res.url().includes('/api/v2/directory/employees'),
      { timeout: 8000 }
    ).catch(() => null);
    await this.searchButton.click();
    await responsePromise;
    await this.recordsFoundLabel.waitFor({ state: 'visible', timeout: 8000 }).catch(() => null);
  }

  async reset(): Promise<void> {
    const responsePromise = this.page.waitForResponse(
      (res) => res.url().includes('/api/v2/directory/employees'),
      { timeout: 8000 }
    ).catch(() => null);
    await this.resetButton.click();
    await responsePromise;
    await this.recordsFoundLabel.waitFor({ state: 'visible', timeout: 8000 }).catch(() => null);
  }
}
