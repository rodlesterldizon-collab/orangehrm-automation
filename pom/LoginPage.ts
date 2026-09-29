import { Page, APIRequestContext, Locator } from '@playwright/test';
import { BasePage } from './BasePage.js';
import { getAdminCredentials } from '../utils/helpers.js';

export class LoginPage extends BasePage {
  readonly root: Locator;
  readonly form: Locator;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorAlert: Locator;
  readonly errorAlertText: Locator;
  readonly requiredErrorLabels: Locator;
  readonly forgotPasswordLink: Locator;

  constructor(page: Page, request: APIRequestContext) {
    super(page, request);
    this.root = this.page.getByRole('main').or(this.page.locator('body')).first();
    this.form = this.root.locator('form').first();
    this.usernameInput = this.form.getByPlaceholder('Username');
    this.passwordInput = this.form.getByPlaceholder('Password');
    this.loginButton = this.form.getByRole('button', { name: 'Login', exact: true });
    this.errorAlert = this.page.getByRole('alert');
    this.errorAlertText = this.errorAlert.locator('p').last();
    this.requiredErrorLabels = this.form.getByText('Required');
    this.forgotPasswordLink = this.form.getByText(/Forgot your password\?/i);
  }

  async navigate(): Promise<void> {
    await this.goto('/web/index.php/auth/login');
  }

  async login(username?: string, password?: string): Promise<void> {
    if (username !== undefined) {
      await this.usernameInput.fill(username);
    }
    if (password !== undefined) {
      await this.passwordInput.fill(password);
    }
    await this.loginButton.click();
  }

  async loginAsAdmin(): Promise<void> {
    const creds = getAdminCredentials();
    await this.login(creds.username, creds.password);
  }
}
