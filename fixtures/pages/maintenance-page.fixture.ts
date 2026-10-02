import { test as base } from '@playwright/test';
import { MaintenancePage } from '../../pom/MaintenancePage.js';
import { loginProgrammatic } from '../../utils/helpers.js';

type MaintenancePageFixtures = {
  maintenancePage: MaintenancePage;
};

export const test = base.extend<MaintenancePageFixtures>({
  maintenancePage: async ({ context, page, request }, use) => {
    const cookies = await context.cookies();
    const hasAuth = cookies.some((c) => c.name === 'orangehrm');
    if (!hasAuth) {
      await loginProgrammatic(context, request);
    }
    const maintenancePage = new MaintenancePage(page, request);
    await use(maintenancePage);
  },
});
