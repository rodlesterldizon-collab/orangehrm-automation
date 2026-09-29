import { test as base } from '@playwright/test';
import { DashboardPage } from '../../pom/DashboardPage.js';
import { loginProgrammatic } from '../../utils/helpers.js';

type DashboardPageFixtures = {
  dashboardPage: DashboardPage;
};

export const test = base.extend<DashboardPageFixtures>({
  dashboardPage: async ({ context, page, request }, use) => {
    // Authenticate via fast backend API call (session cookie injected directly into context)
    await loginProgrammatic(context, request);
    const dashboardPage = new DashboardPage(page, request);
    await dashboardPage.navigate();
    await use(dashboardPage);
  },
});
