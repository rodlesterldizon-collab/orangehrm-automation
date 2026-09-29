import { test as base } from '@playwright/test';
import { AdminPage } from '../../pom/AdminPage.js';
import { loginProgrammatic } from '../../utils/helpers.js';

type AdminPageFixtures = {
  adminPage: AdminPage;
};

export const test = base.extend<AdminPageFixtures>({
  adminPage: async ({ context, page, request }, use) => {
    const cookies = await context.cookies();
    const hasAuth = cookies.some((c) => c.name === 'orangehrm');
    if (!hasAuth) {
      await loginProgrammatic(context, request);
    }
    const adminPage = new AdminPage(page, request);
    await adminPage.navigate();
    await use(adminPage);
  },
});
