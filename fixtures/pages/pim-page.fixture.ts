import { test as base } from '@playwright/test';
import { PimPage } from '../../pom/PimPage.js';
import { loginProgrammatic } from '../../utils/helpers.js';

type PimPageFixtures = {
  pimPage: PimPage;
};

export const test = base.extend<PimPageFixtures>({
  pimPage: async ({ context, page, request }, use) => {
    const cookies = await context.cookies();
    const hasAuth = cookies.some((c) => c.name === 'orangehrm');
    if (!hasAuth) {
      await loginProgrammatic(context, request);
    }
    const pimPage = new PimPage(page, request);
    await pimPage.navigateToList();
    await use(pimPage);
  },
});
