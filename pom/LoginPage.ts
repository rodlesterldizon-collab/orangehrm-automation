import { Page, APIRequestContext, Locator } from '@playwright/test';
import { BasePage } from './BasePage.js';
import { getAdminCredentials } from '../utils/helpers.js';

export class LoginPage extends BasePage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorAlert: Locator;
  readonly errorAlertText: Locator;
  readonly requiredErrorLabels: Locator;
  readonly forgotPasswordLink: Locator;

  constructor(page: Page, request: APIRequestContext) {
    super(page, request);
    this.usernameInput = page.getByPlaceholder('Username');
    this.passwordInput = page.getByPlaceholder('Password');
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.errorAlert = page.locator('.oxd-alert--error');
    this.errorAlertText = page.locator('.oxd-alert-content-text');
    this.requiredErrorLabels = page.locator('.oxd-input-field-error-message');
    this.forgotPasswordLink = page.locator('.orangehrm-login-forgot');
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

