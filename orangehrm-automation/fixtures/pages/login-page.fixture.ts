import { test as base } from '@playwright/test';
import { LoginPage } from '../../pom/LoginPage.js';

type LoginPageFixtures = {
  loginPage: LoginPage;
};

export const test = base.extend<LoginPageFixtures>({
  loginPage: async ({ page, request }, use) => {
    const loginPage = new LoginPage(page, request);
    await loginPage.navigate();
    await use(loginPage);
  },
});
