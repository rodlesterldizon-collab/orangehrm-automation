import { test as setup } from '@playwright/test';
import { createAndSaveStorageState, getAdminCredentials } from '../utils/helpers.js';
import path from 'path';

export const ADMIN_AUTH_FILE = path.join(process.cwd(), 'playwright/.auth/admin.json');

setup('authenticate admin via fast API and generate storageState', async ({ context, request }) => {
  const creds = getAdminCredentials();
  await createAndSaveStorageState(
    context,
    request,
    creds.username,
    creds.password,
    ADMIN_AUTH_FILE
  );
});
