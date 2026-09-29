import { Page, APIRequestContext, Locator } from '@playwright/test';
import { BasePage } from './BasePage.js';

export class DirectoryPage extends BasePage {
  readonly root: Locator;
  readonly form: Locator;
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
    this.root = this.page.getByRole('main');
    this.form = this.root.locator('form').first();

    // Scoped form inputs without using any CSS class names
    this.searchNameInput = this.form.getByPlaceholder('Type for hints...');
    this.jobTitleDropdown = this.form
      .locator('div')
      .filter({ has: this.page.getByText('Job Title', { exact: true }) })
      .locator('[role="combobox"]')
      .or(
        this.form
          .locator('div')
          .filter({ has: this.page.getByText('Job Title', { exact: true }) })
          .locator('i')
          .locator('..')
      )
      .first();

    this.locationDropdown = this.form
      .locator('div')
      .filter({ has: this.page.getByText('Location', { exact: true }) })
      .locator('[role="combobox"]')
      .or(
        this.form
          .locator('div')
          .filter({ has: this.page.getByText('Location', { exact: true }) })
          .locator('i')
          .locator('..')
      )
      .first();

    this.searchButton = this.form.getByRole('button', { name: 'Search', exact: true });
    this.resetButton = this.form.getByRole('button', { name: 'Reset', exact: true });

    // Results and cards container
    this.recordsFoundLabel = this.root.getByText(/Records? Found|No Records Found/i).first();
    this.cardGrid = this.root.locator('div').filter({ has: this.recordsFoundLabel }).last();
    this.cardsGrid = this.cardGrid;
    this.gridContainer = this.root.locator('div[role="list"]').or(this.root.locator('main > div'));
    this.employeeCards = this.root.locator('img[alt*="Profile"], img[alt*="profile"]').locator('..').locator('..');

    // Overlay dropdowns & options
    this.autocompleteDropdown = this.page.getByRole('listbox').or(this.page.locator('ul[role="menu"]'));
    this.autocompleteOptions = this.page.getByRole('option');
    this.selectDropdown = this.page.getByRole('listbox');
    this.selectOptions = this.page.getByRole('option');
  }

  async navigate(): Promise<void> {
    await this.goto('/web/index.php/directory/viewDirectory');
    await this.recordsFoundLabel.waitFor({ state: 'visible', timeout: 10000 }).catch(() => null);
  }
}
