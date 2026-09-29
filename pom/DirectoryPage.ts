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

  constructor(page: Page, request: APIRequestContext) {
    super(page, request);

    // Form inputs using semantic roles, placeholders, and layout-adjacent selectors
    this.searchNameInput = page.getByPlaceholder('Type for hints...');
    this.jobTitleDropdown = page
      .locator('div')
      .filter({ has: page.getByText('Job Title', { exact: true }) })
      .locator('i')
      .locator('..');

    this.locationDropdown = page
      .locator('div')
      .filter({ has: page.getByText('Location', { exact: true }) })
      .locator('i')
      .locator('..');

    this.searchButton = page.getByRole('button', { name: 'Search', exact: true });
    this.resetButton = page.getByRole('button', { name: 'Reset', exact: true });

    // Results & records counter
    this.recordsFoundLabel = page.getByText(/Records? Found|No Records Found/i).first();
    this.cardGrid = page.locator('.orangehrm-container');
    this.cardsGrid = this.cardGrid;
    this.gridContainer = page.locator('.oxd-grid-4, .orangehrm-container');
    this.employeeCards = page.locator('.orangehrm-directory-card, .oxd-grid-item .oxd-sheet');

    // Autocomplete & dropdown overlays
    this.autocompleteDropdown = page.locator('.oxd-autocomplete-dropdown, [role="listbox"]');
    this.autocompleteOptions = page.locator('.oxd-autocomplete-option, [role="option"]');
    this.selectDropdown = page.locator('.oxd-select-dropdown, [role="listbox"]');
    this.selectOptions = page.locator('.oxd-select-option, [role="option"]');
  }

  async navigate(): Promise<void> {
    await this.goto('/web/index.php/directory/viewDirectory');
    await this.recordsFoundLabel.waitFor({ state: 'visible', timeout: 10000 }).catch(() => null);
  }
}
