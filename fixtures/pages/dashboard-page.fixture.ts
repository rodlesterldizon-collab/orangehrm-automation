import { test as base } from '@playwright/test';
import { DashboardPage } from '../../pom/DashboardPage.js';
import { loginProgrammatic } from '../../utils/helpers.js';

type DashboardPageFixtures = {
  dashboardPage: DashboardPage;
};

export const test = base.extend<DashboardPageFixtures>({
  dashboardPage: async ({ context, page, request }, use) => {
    const cookies = await context.cookies();
    const hasAuth = cookies.some((c) => c.name === 'orangehrm');
    if (!hasAuth) {
      await loginProgrammatic(context, request);
    }
    const dashboardPage = new DashboardPage(page, request);
    await dashboardPage.navigate();
    await use(dashboardPage);
  },
});
