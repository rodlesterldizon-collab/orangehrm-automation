import { test as base } from '@playwright/test';
import { MaintenancePage } from '../../pom/MaintenancePage.js';
import { loginProgrammatic, verifyAdminAccessProgrammatic } from '../../utils/helpers.js';

type MaintenancePageFixtures = {
  maintenancePage: MaintenancePage;
};

export const test = base.extend<MaintenancePageFixtures>({
  maintenancePage: async ({ context, page }, use) => {
    const cookies = await context.cookies();
    const hasAuth = cookies.some((c) => c.name === 'orangehrm');
    if (!hasAuth) {
      await loginProgrammatic(context, context.request);
    }
    // Programmatically ensure administrator access is verified via API so UI tests don't wait
    await verifyAdminAccessProgrammatic(page.request);
    const maintenancePage = new MaintenancePage(page, page.request);
    await use(maintenancePage);
  },
});
