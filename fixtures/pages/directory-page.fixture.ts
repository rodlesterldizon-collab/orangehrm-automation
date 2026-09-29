import { test as base } from '@playwright/test';
import { DirectoryPage } from '../../pom/DirectoryPage.js';
import { loginProgrammatic } from '../../utils/helpers.js';

type DirectoryPageFixtures = {
  directoryPage: DirectoryPage;
};

export const test = base.extend<DirectoryPageFixtures>({
  directoryPage: async ({ context, page, request }, use) => {
    const cookies = await context.cookies();
    const hasAuth = cookies.some((c) => c.name === 'orangehrm');
    if (!hasAuth) {
      await loginProgrammatic(context, request);
    }
    const directoryPage = new DirectoryPage(page, request);
    await directoryPage.navigate();
    await use(directoryPage);
  },
});
