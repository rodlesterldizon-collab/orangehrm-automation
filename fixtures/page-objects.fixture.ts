import { mergeTests } from '@playwright/test';
import { test as loginPageTest } from './pages/login-page.fixture.js';
import { test as dashboardPageTest } from './pages/dashboard-page.fixture.js';
import { test as pimPageTest } from './pages/pim-page.fixture.js';
import { test as adminPageTest } from './pages/admin-page.fixture.js';
import { test as directoryPageTest } from './pages/directory-page.fixture.js';
import { test as maintenancePageTest } from './pages/maintenance-page.fixture.js';

// Merge all fixtures into a single unified test runner
export const test = mergeTests(
  loginPageTest,
  dashboardPageTest,
  pimPageTest,
  adminPageTest,
  directoryPageTest,
  maintenancePageTest
);

export { expect } from '@playwright/test';
