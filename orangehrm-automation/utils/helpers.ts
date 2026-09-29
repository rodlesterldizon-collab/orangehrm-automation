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
      'Authentication credentials not found! Please ensure ADMIN_USERNAME and ADMIN_PASSWORD are set in .env.test or .env'
    );
  }

  return { username, password };
}

/**
 * Programmatic login helper:
 * In OrangeHRM 5.x, login requires extracting the CSRF token from the login page,
 * then posting to /web/index.php/auth/validate with urlencoded form data.
 * Extracts the authenticated orangehrm cookie and injects into the in-memory BrowserContext.
 */
export async function loginProgrammatic(
  context: BrowserContext,
  request: APIRequestContext,
  username?: string,
  password?: string
): Promise<string> {
  const creds = getAdminCredentials();
  const user = username || creds.username;
  const pass = password || creds.password;
  const baseUrl = process.env.PLAYWRIGHT_BASE_URL || 'https://opensource-demo.orangehrmlive.com';

  // Step 1: GET the login page to acquire initial session cookie & CSRF token
  const getLoginPageRes = await request.get(`${baseUrl}/web/index.php/auth/login`);
  const initialHtml = await getLoginPageRes.text();

  // Extract CSRF token from OrangeHRM Vue component prop
  const tokenMatch = initialHtml.match(/:token="&quot;([^&]+)&quot;"/);
  const csrfToken = tokenMatch ? tokenMatch[1] : '';

  // Step 2: POST credentials to /web/index.php/auth/validate
  const validateResponse = await request.post(`${baseUrl}/web/index.php/auth/validate`, {
    form: {
      _token: csrfToken,
      username: user,
      password: pass,
    },
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    maxRedirects: 0, // Catch the 302 redirect with new auth cookie
  });

  // Extract the authenticated orangehrm cookie
  const setCookieHeaders = validateResponse.headersArray?.() || [];
  let authCookieValue = '';

  for (const h of setCookieHeaders) {
    if (h.name.toLowerCase() === 'set-cookie' && h.value.includes('orangehrm=')) {
      const match = h.value.match(/orangehrm=([^;]+)/);
      if (match) {
        authCookieValue = match[1];
      }
    }
  }

  // Fallback to headers string if headersArray is not present
  if (!authCookieValue) {
    const rawSetCookie = validateResponse.headers()['set-cookie'] || '';
    const match = rawSetCookie.match(/orangehrm=([^;]+)/);
    if (match) {
      authCookieValue = match[1];
    }
  }

  // Inject authenticated cookie into BrowserContext
  if (authCookieValue && context) {
    const urlObj = new URL(baseUrl);
    await context.addCookies([
      {
        name: 'orangehrm',
        value: authCookieValue,
        domain: urlObj.hostname,
        path: '/web',
        httpOnly: true,
        secure: urlObj.protocol === 'https:',
        sameSite: 'Lax',
      },
    ]);
  }

  return authCookieValue;
}

/**
 * Returns authenticated session cookie string for pure API tests.
 */
export async function getAuthCookie(
  request: APIRequestContext,
  username?: string,
  password?: string
): Promise<string> {
  const creds = getAdminCredentials();
  const user = username || creds.username;
  const pass = password || creds.password;
  const baseUrl = process.env.PLAYWRIGHT_BASE_URL || 'https://opensource-demo.orangehrmlive.com';

  const getLoginPageRes = await request.get(`${baseUrl}/web/index.php/auth/login`);
  const initialHtml = await getLoginPageRes.text();
  const tokenMatch = initialHtml.match(/:token="&quot;([^&]+)&quot;"/);
  const csrfToken = tokenMatch ? tokenMatch[1] : '';

  const validateResponse = await request.post(`${baseUrl}/web/index.php/auth/validate`, {
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
  return match ? match[1] : '';
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
