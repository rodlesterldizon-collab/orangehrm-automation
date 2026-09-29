/**
 * Test Planner Generator CLI
 * 
 * Generates structured QA Test Plans and Playwright TypeScript test boilerplates
 * based on user-provided feature descriptions, user stories, or API endpoints.
 * 
 * Usage:
 *   node --experimental-strip-types tools/test-planner.ts --feature="Employee Termination" --module="PIM" --type="e2e"
 *   npm run plan:generate
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface PlanOptions {
  featureName: string;
  moduleName: string;
  type: 'e2e' | 'api' | 'responsive';
  tags: string[];
  outputPath?: string;
}

export function generateTestPlanMarkdown(options: PlanOptions): string {
  const { featureName, moduleName, type, tags } = options;
  const tagList = tags.map(t => `\`@${t}\``).join(' ');
  const dateStr = new Date().toISOString().split('T')[0];

  return `# Test Plan: ${featureName}
**Module:** ${moduleName} | **Type:** ${type.toUpperCase()} | **Date:** ${dateStr}
**Tags:** ${tagList}

## 1. Executive Summary & Objective
Verify that the **${featureName}** capability in OrangeHRM OS 5.9 functions according to business specifications, enforces role-based access constraints, maintains data integrity across database records, and handles both positive workflows and negative edge cases gracefully.

## 2. Requirement Traceability Matrix (RTM)
| Test ID | Scenario | Priority | Expected Outcome | Viewport Coverage |
| :--- | :--- | :--- | :--- | :--- |
| **TC-${moduleName.toUpperCase()}-01** | Happy Path: Complete ${featureName} with valid inputs | P0 (Critical) | HTTP 200/201 or UI Success Toast | Desktop, Tablet, Mobile |
| **TC-${moduleName.toUpperCase()}-02** | Validation: Missing mandatory fields submission | P1 (High) | Inline error "Required" shown | Desktop |
| **TC-${moduleName.toUpperCase()}-03** | Boundary: Max character limit & special character inputs | P2 (Medium) | Truncation or validation error | Desktop |
| **TC-${moduleName.toUpperCase()}-04** | Security / RBAC: Unauthorized role access attempt | P1 (High) | Redirect or HTTP 403 Forbidden | Desktop, Mobile |
| **TC-${moduleName.toUpperCase()}-05** | Idempotency / Duplicate submission prevention | P2 (Medium) | HTTP 422 or "Already Exists" | Desktop |

## 3. Preconditions & Test Data Setup
- Target Environment: \`https://opensource-demo.orangehrmlive.com\`
- Active Administrator or Manager Session loaded via storageState / session cookie.
- Randomized dynamic test data generated via Faker / test-data generators to avoid collision.

## 4. Test Automation Strategy & Assertion Points
- **UI Tests:** Use Page Object Model (POM) under \`pom/pages/\`. Assert URL transitions, banner toasts, table row updates, and button states.
- **API Tests:** Use \`request\` context. Validate response status, response latency (<1500ms), and AJV JSON schema conformity.
- **Cross-Browser & Viewport:** Execute on Chromium, Edge, WebKit (Safari), iPad, and Pixel 7.
`;
}

export function generatePlaywrightBoilerplate(options: PlanOptions): string {
  const { featureName, moduleName, type, tags } = options;
  const sanitizedName = featureName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const tagString = tags.map(t => `@${t}`).join(' ');

  if (type === 'api') {
    return `import { test, expect } from '@playwright/test';
import { getAuthCookie } from '../../utils/helpers.js';

test.describe('API ${moduleName} - ${featureName} Suite', () => {
  let cookieHeader: { Cookie: string };

  test.beforeEach(async ({ request }) => {
    const authCookie = await getAuthCookie(request);
    cookieHeader = { Cookie: \`orangehrm=\${authCookie}\` };
  });

  test('[TC-${moduleName.toUpperCase()}-01] ${tagString} — Should execute ${featureName} successfully', async ({ request }) => {
    const response = await request.get('/web/index.php/api/v2/${moduleName.toLowerCase()}/${sanitizedName}', {
      headers: cookieHeader,
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.data).toBeDefined();
  });

  test('[TC-${moduleName.toUpperCase()}-02] ${tagString} — Should reject unauthorized requests', async ({ request }) => {
    const unauthResponse = await request.get('/web/index.php/api/v2/${moduleName.toLowerCase()}/${sanitizedName}');
    expect(unauthResponse.status()).toBe(401);
  });
});
`;
  }

  return `import { test, expect } from '../../fixtures/page-objects.fixture.js';

test.describe('${moduleName} - ${featureName} E2E Suite', () => {
  test.beforeEach(async ({ loginPage, page }) => {
    await loginPage.navigate();
    await loginPage.loginAsAdmin();
    await page.waitForURL(/.*dashboard/);
  });

  test('[TC-${moduleName.toUpperCase()}-01] ${tagString} — Positive flow for ${featureName}', async ({ page }) => {
    // 1. Navigate to target module
    // 2. Perform actions using POM
    // 3. Assert success notifications and UI persistence
    await expect(page.locator('.oxd-topbar-header')).toBeVisible();
  });

  test('[TC-${moduleName.toUpperCase()}-02] ${tagString} — Form validation on empty submit', async ({ page }) => {
    // 1. Trigger form submit without required values
    // 2. Assert error indicators
    const requiredLabels = page.locator('.oxd-input-field-error-message');
    // await expect(requiredLabels.first()).toBeVisible();
  });
});
`;
}

// CLI Execution handler
function runCli() {
  const args = process.argv.slice(2);
  let feature = 'Employee Onboarding & Verification';
  let module = 'PIM';
  let type: 'e2e' | 'api' | 'responsive' = 'e2e';
  let tags = ['regression', 'sanity'];

  for (const arg of args) {
    if (arg.startsWith('--feature=')) feature = arg.split('=')[1];
    if (arg.startsWith('--module=')) module = arg.split('=')[1];
    if (arg.startsWith('--type=')) type = arg.split('=')[1] as any;
    if (arg.startsWith('--tags=')) tags = arg.split('=')[1].split(',');
  }

  const outputDir = path.resolve(__dirname, '../tests/generated');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const slug = feature.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const planMarkdown = generateTestPlanMarkdown({ featureName: feature, moduleName: module, type, tags });
  const testCode = generatePlaywrightBoilerplate({ featureName: feature, moduleName: module, type, tags });

  const planPath = path.join(outputDir, `${slug}.plan.md`);
  const specPath = path.join(outputDir, `${slug}.${type}.spec.ts`);

  fs.writeFileSync(planPath, planMarkdown, 'utf-8');
  fs.writeFileSync(specPath, testCode, 'utf-8');

  console.log(`\n======================================================`);
  console.log(`🎯 Test Planner Generator Completed Successfully!`);
  console.log(`======================================================`);
  console.log(`📋 Test Plan:   ${planPath}`);
  console.log(`⚡ Playwright:  ${specPath}`);
  console.log(`🏷️  Tags:        ${tags.join(', ')}`);
  console.log(`======================================================\n`);
}

// Run CLI when invoked directly
runCli();
