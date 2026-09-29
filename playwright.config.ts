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

export default defineConfig({
  testDir: '.',
  testMatch: ['tests/e2e/**/*.spec.ts', 'tests/api/**/*.spec.ts'],
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
    // Desktop Cross-Browser Matrix: Chromium, Edge, and Safari
    // ─────────────────────────────────────────────────────────────
    {
      name: 'desktop-chrome',
      testDir: 'tests/e2e',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: 'desktop-edge',
      testDir: 'tests/e2e',
      use: {
        ...devices['Desktop Edge'],
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: 'desktop-safari',
      testDir: 'tests/e2e',
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1280, height: 720 },
      },
    },

    // ─────────────────────────────────────────────────────────────
    // Responsive Viewports: Tablet (iPad) & Mobile (Pixel 7)
    // ─────────────────────────────────────────────────────────────
    {
      name: 'tablet',
      testDir: 'tests/e2e',
      grep: /@tablet/,
      use: {
        ...devices['iPad (gen 7)'],
        viewport: { width: 810, height: 1080 },
      },
    },
    {
      name: 'mobile',
      testDir: 'tests/e2e',
      grep: /@mobile/,
      use: {
        ...devices['Pixel 7'],
        viewport: { width: 393, height: 851 },
        isMobile: true,
      },
    },

    // ─────────────────────────────────────────────────────────────
    // Headless REST API & Schema Validation Suite
    // ─────────────────────────────────────────────────────────────
    {
      name: 'api',
      testDir: 'tests/api',
      use: {
        baseURL: baseUrl,
        extraHTTPHeaders: {
          'Accept': 'application/json',
        },
      },
    },
  ],
});
