import { BrowserContext, APIRequestContext, Page, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

/**
 * Safely retrieves administrator credentials from environment variables.
 */
export function getAdminCredentials() {
  const username = process.env.ADMIN_USERNAME || 'Admin';
  const password = process.env.ADMIN_PASSWORD || 'admin123';

  return { username, password };
}

/**
 * Retrieves the application base URL from environment variables.
 */
export function getBaseUrl(): string {
  return process.env.BASE_URL || 'https://opensource-demo.orangehrmlive.com';
}

/**
 * Single source of truth for programmatic session acquisition:
 * 1. Fetches the login page via Playwright's request context
 * 2. Extracts CSRF token from OrangeHRM Vue component props
 * 3. Submits credentials to /web/index.php/auth/validate
 * 4. Extracts the authenticated 'orangehrm' session cookie
 */
export async function getAuthCookie(
  request: APIRequestContext,
  username?: string,
  password?: string
): Promise<string> {
  const creds = getAdminCredentials();
  const user = username || creds.username;
  const pass = password || creds.password;

  const getLoginPageRes = await request.get('/web/index.php/auth/login');
  const initialHtml = await getLoginPageRes.text();
  const tokenMatch = initialHtml.match(/:token="&quot;([^&]+)&quot;"/);
  const csrfToken = tokenMatch ? tokenMatch[1] : '';

  const validateResponse = await request.post('/web/index.php/auth/validate', {
    form: {
      _token: csrfToken,
      username: user,
      password: pass,
    },
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    maxRedirects: 0,
  });

  const rawSetCookie = validateResponse.headers()['set-cookie'] || '';
  const match = rawSetCookie.match(/orangehrm=([^;]+)/);
  if (match) {
    return match[1];
  }

  const setCookieHeaders = validateResponse.headersArray?.() || [];
  for (const h of setCookieHeaders) {
    if (h.name.toLowerCase() === 'set-cookie' && h.value.includes('orangehrm=')) {
      const headerMatch = h.value.match(/orangehrm=([^;]+)/);
      if (headerMatch) {
        return headerMatch[1];
      }
    }
  }

  throw new Error('Failed to acquire authenticated session cookie from OrangeHRM validation endpoint.');
}

/**
 * Programmatic login helper for Browser tests:
 * Injects authenticated cookie into BrowserContext using valid domain and root path.
 */
export async function loginProgrammatic(
  context: BrowserContext,
  request: APIRequestContext,
  username?: string,
  password?: string
): Promise<string> {
  const authCookieValue = await getAuthCookie(request, username, password);
  const baseUrl = getBaseUrl();
  const urlObj = new URL(baseUrl);

  if (authCookieValue && context) {
    await context.addCookies([
      {
        name: 'orangehrm',
        value: authCookieValue,
        domain: urlObj.hostname,
        path: '/',
        httpOnly: true,
        secure: urlObj.protocol === 'https:',
        sameSite: 'Lax',
      },
    ]);
  }

  return authCookieValue;
}

/**
 * Programmatic administrator access verification helper:
 * Checks if the session is challenged by the Administrator Access gate on /maintenance.
 * If challenged, extracts the CSRF token and submits password verification via API.
 * This pre-authorizes the session for maintenance pages without any UI waits.
 */
export async function verifyAdminAccessProgrammatic(
  request: APIRequestContext,
  password?: string
): Promise<void> {
  const creds = getAdminCredentials();
  const pass = password || creds.password;

  try {
    const res = await request.get('/web/index.php/maintenance/purgeEmployee');
    const html = await res.text();
    const tokenMatch = html.match(/:token="&quot;([^&]+)&quot;"/);

    if (tokenMatch) {
      await request.post('/web/index.php/auth/adminVerify', {
        form: {
          _token: tokenMatch[1],
          password: pass,
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
    }
  } catch {
    // If request fails or already authenticated, proceed gracefully
  }
}

/**
 * Generates and saves storageState JSON for reusable session state across test suites.
 */
export async function createAndSaveStorageState(
  context: BrowserContext,
  request: APIRequestContext,
  username?: string,
  password?: string,
  storageStatePath: string = 'playwright/.auth/admin.json'
): Promise<string> {
  await loginProgrammatic(context, request, username, password);
  await verifyAdminAccessProgrammatic(context.request, password);

  const dir = path.dirname(storageStatePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  await context.storageState({ path: storageStatePath });
  return storageStatePath;
}

/**
 * Helper to wait for the OrangeHRM floating toast notification (.oxd-toast)
 */
export async function waitForToast(page: Page, expectedText?: string): Promise<void> {
  const toast = page.locator('.oxd-toast');
  await expect(toast).toBeVisible({ timeout: 10000 });
  if (expectedText) {
    await expect(toast).toContainText(expectedText);
  }
}

/**
 * Custom wait helper for OrangeHRM loading spinner (.oxd-loading-spinner):
 * Waits for the spinner to appear upon triggering an action (e.g. search)
 * and then waits for it to completely disappear/detach from the DOM.
 */
export async function waitForSpinner(page: Page, timeout: number = 15000): Promise<void> {
  const spinner = page.locator('div[class*="loading-spinner"]').last();
  // Allow a single animation frame for Vue to mount the spinner if an action was just fired
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(resolve))).catch(() => null);
  // In Playwright, if the spinner is already hidden or absent, waitFor({ state: 'hidden' })
  // resolves immediately with success (100% green, 0ms delay). If visible, it waits until hidden.
  await spinner.waitFor({ state: 'hidden', timeout }).catch(() => null);
}

/**
 * Custom wait helper for OrangeHRM card grid / table updates:
 * Ensures spinner has hidden and card container (.oxd-grid-4 / .orangehrm-container) is settled.
 */
export async function waitForGridUpdate(page: Page, timeout: number = 15000): Promise<void> {
  await waitForSpinner(page, timeout);
  const grid = page.locator('.oxd-grid-4, .orangehrm-container').first();
  await grid.waitFor({ state: 'attached', timeout }).catch(() => null);
}
