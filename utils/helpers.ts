import { BrowserContext, APIRequestContext, Page, expect } from '@playwright/test';

/**
 * Safely retrieves administrator credentials from environment variables.
 * Values are loaded from .env.test (or .env override) via dotenv.
 */
export function getAdminCredentials() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !password) {
    throw new Error(
      'Authentication credentials not found! Please ensure ADMIN_USERNAME and ADMIN_PASSWORD are set in .env.test (copied from .env.example)'
    );
  }

  return { username, password };
}

/**
 * Retrieves the application base URL from environment variables.
 */
export function getBaseUrl(): string {
  const baseUrl = process.env.BASE_URL;
  if (!baseUrl) {
    throw new Error(
      'BASE_URL not configured! Please ensure BASE_URL is set in .env.test'
    );
  }
  return baseUrl;
}

/**
 * Single source of truth for programmatic session acquisition:
 * 1. Fetches the login page via Playwright's request context (relative URL)
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
 * Leverages getAuthCookie() and injects the session cookie directly into BrowserContext
 * to bypass the UI login form and save 3-5 seconds per test.
 */
export async function loginProgrammatic(
  context: BrowserContext,
  request: APIRequestContext,
  username?: string,
  password?: string
): Promise<string> {
  const authCookieValue = await getAuthCookie(request, username, password);
  const baseUrl = getBaseUrl();

  if (authCookieValue && context) {
    await context.addCookies([
      {
        name: 'orangehrm',
        value: authCookieValue,
        url: baseUrl,
        path: '/web',
      },
    ]);
  }

  return authCookieValue;
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
