import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load test environment variables (.env overrides .env.test)
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config({ path: path.resolve(__dirname, '.env.test') });

const baseUrl =
  process.env.BASE_URL ||
  'https://opensource-demo.orangehrmlive.com';

const authFile = 'playwright/.auth/admin.json';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : 1,
  reporter: process.env.CI
    ? [['html', { open: 'never' }], ['github'], ['list']]
    : [['html', { open: 'never' }], ['list']],
  timeout: 30000,
  expect: {
    timeout: 10000,
  },
  use: {
    baseURL: baseUrl,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10000,
    navigationTimeout: 15000,
  },
  projects: [
    // ─────────────────────────────────────────────────────────────
    // Global Auth Setup: Authenticates Once & Caches StorageState
    // ─────────────────────────────────────────────────────────────
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },

    // ─────────────────────────────────────────────────────────────
    // Desktop Cross-Browser Matrix: Chromium, Edge, and Safari
    // ─────────────────────────────────────────────────────────────
    {
      name: 'desktop-chrome',
      testMatch: /e2e\/.*\.spec\.ts/,
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
        storageState: authFile,
      },
    },
    {
      name: 'desktop-edge',
      testMatch: /e2e\/.*\.spec\.ts/,
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Edge'],
        viewport: { width: 1280, height: 720 },
        storageState: authFile,
      },
    },
    {
      name: 'desktop-safari',
      testMatch: /e2e\/.*\.spec\.ts/,
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1280, height: 720 },
        storageState: authFile,
      },
    },

    // ─────────────────────────────────────────────────────────────
    // Responsive Viewports: Tablet (iPad) & Mobile (Pixel 7)
    // ─────────────────────────────────────────────────────────────
    {
      name: 'tablet',
      testMatch: /e2e\/.*\.spec\.ts/,
      dependencies: ['setup'],
      grep: /@tablet/,
      use: {
        ...devices['iPad 9th/8th/mini/5th/older'],
        viewport: { width: 768, height: 1024 },
        storageState: authFile,
      },
    },
    {
      name: 'mobile',
      testMatch: /e2e\/.*\.spec\.ts/,
      dependencies: ['setup'],
      grep: /@mobile/,
      use: {
        ...devices['Pixel 7'],
        viewport: { width: 393, height: 851 },
        isMobile: true,
        storageState: authFile,
      },
    },

    // ─────────────────────────────────────────────────────────────
    // Headless REST API & Schema Validation Suite
    // ─────────────────────────────────────────────────────────────
    {
      name: 'api',
      testMatch: /api\/.*\.spec\.ts/,
      use: {
        baseURL: baseUrl,
        extraHTTPHeaders: {
          'Accept': 'application/json',
        },
      },
    },
  ],
});
