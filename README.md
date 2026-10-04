# OrangeHRM Enterprise QA Automation Framework
## Playwright TypeScript · Containerized Test Runner · Viewport Responsive Suites · AJV Schema Contracts · Autonomous Planner & Locator Auditor

[![Playwright](https://img.shields.io/badge/Playwright-v1.62.1-45ba4b?style=for-the-badge&logo=playwright&logoColor=white)](https://playwright.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-v5.9.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-v22.x-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Container Image](https://img.shields.io/badge/GHCR%20Runner-v1.62.1-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://github.com/rodlesterldizon-collab/core-test-suite)
[![AJV Schema](https://img.shields.io/badge/AJV-Draft--07%20Contracts-23C48E?style=for-the-badge&logo=json&logoColor=white)](https://ajv.js.org/)
[![CI Pipeline](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)](https://github.com/features/actions)
[![Test Matrix](https://img.shields.io/badge/Test%20Matrix-182%20Executions-success?style=for-the-badge)](https://playwright.dev/)

> **Target Platform:** OrangeHRM OS 5.9 Open Source (`https://opensource-demo.orangehrmlive.com`)  
> **Core Test Package & Container:** [`github.com/rodlesterldizon-collab/core-test-suite`](https://github.com/rodlesterldizon-collab/core-test-suite)  
> **Container Image:** `ghcr.io/rodlesterldizon-collab/core-test-suite/test-runner:v1.62.1`  
> **Test Architecture:** 40 UI/E2E Regression & Viewport Cases + 36 Backend API Endpoints + 4 AJV Schema Contracts (182 total cross-browser matrix executions) + Autonomous Test Planner Generator & Locator Resilience Auditor.

---

## 🏁 1. Quick Start: Execution & Submission Evaluation Guide

> **Submission Requirement:** Another QA engineer must be able to clone your submission and run the suite using only your instructions.

### 📋 Environment & Versions
| Component | Version / Specification |
| :--- | :--- |
| **Playwright Version** | `v1.62.1` (`@playwright/test: ^1.58.2`) |
| **Node.js Runtime** | `v22.23.2` *(Compatible with Node.js LTS `v20.x` and `v22.x`)* |
| **TypeScript Engine** | `v5.9.3` |
| **JSON Schema Validator** | `AJV v8.17.1` *(Draft-07 & Draft-2020-12)* |
| **Container Image** | `ghcr.io/rodlesterldizon-collab/core-test-suite/test-runner:v1.62.1` |

### 💻 1-Minute Local Setup
Clone the repository and install all dependencies:

```bash
# 1. Clone repository and navigate into project directory
git clone <repo-url> && cd orangehrm-automation

# 2. Install project dependencies
npm ci

# 3. Install Playwright browser binaries & OS dependencies
npx playwright install --with-deps

# 4. Initialize local environment config (zero secrets required for public demo)
cp .env.example .env.test
```

### 🚀 Test Execution Commands

```bash
# Run Entire Full Test Suite (E2E Regression + REST API + AJV Schema)
npm test

# Run by Target Sub-Suite
npm run test:api          # Headless REST API & Schema Contracts (<15s)
npm run test:schema       # AJV JSON Schema Contract Tests only
npm run test:desktop      # Desktop Chromium E2E Suite
npm run test:desktop:all  # Desktop Cross-Browser Matrix (Chrome, Edge, Safari)
npm run test:tablet       # Tablet Viewport Suite (iPad 768x1024)
npm run test:mobile       # Mobile Viewport Suite (Pixel 7 393x851)
npm run test:nav          # 12-Module Sidebar Navigation Health Matrix
npm run test:dashboard    # Dashboard Widgets & Shortcuts Suite
npm run test:maintenance  # Maintenance Re-Auth & Purge Suite

# Execution Modes
npm test                  # Headless Mode (Default for CI/CD & Fast Terminal)
npm run test:headed       # Headed Mode (Visible browser windows)
npm run test:ui           # Interactive UI Mode (Visual Time-Travel & DOM Timeline)
npm run test:debug        # Step-by-Step Playwright Inspector Debugger

# HTML Reports
npm run report            # View local HTML test report (or open playwright-report/index.html)
```

> **GitHub Actions CI Reports:** Download the `playwright-report-*` artifacts directly from any workflow run summary under the repository's **Actions** tab (14-day retention).

### ⚠️ Known Limitations & Operational Assumptions
1. **Public Demo Shared State & Reset Cycles**: `opensource-demo.orangehrmlive.com` is a live, shared public sandbox subject to periodic database wipes and high worldwide concurrency. Tests generate dynamic, timestamped data (`Faker` + `Date.now()`) with `finally { delete }` cleanup blocks to avoid collisions.
2. **Rate Limiting (`HTTP 429`)**: High burst concurrency from parallel runners can trigger server rate limiting; worker concurrency is throttled (`workers: 2`) with built-in retry mechanisms.
3. **Network Latency Variance**: Public demo server response times fluctuate between 200ms and 2.5s. All assertions use Playwright web-first auto-waiting with zero hardcoded sleeps (`page.waitForTimeout`).
4. **Deactivated SMTP / External Email**: Transactional outbound email notifications (e.g. Leave Approval emails) cannot be validated in an external mailbox because mail servers are disabled on the public demo instance.
5. **Upstream Defect on Recruitment API**: Submitting an empty candidate email triggers an unhandled `HTTP 500` instead of `422`. Handled with `@fixme` annotation and tolerance `[422, 500]`.
6. **Upstream Environment Change on Buzz Module (October 4, 2026)**: The public demo instance removed the Buzz link from the side navigation drawer and returned `HTTP 403` on API feed calls. Related tests (`[TC-NAV-12]`, `[TC-API-28]`) are marked with `test.skip` and annotated with `{ type: 'issue', description: 'The Buzz module in the sidenav has been removed on October 4, 2026.' }` while maintaining full health validation across all active modules.

---

## 🎯 2. Executive Scope Summary: What Was Covered, Why & Architectural Justification

To provide maximum architectural value and robust regression confidence across OrangeHRM OS 5.9, coverage was selected based on **Enterprise Risk-Based Testing (RBT)**, targeting the platform's core identity spine, transactional mutations, responsive fluidity, and backend API integrity:

| Functional Area / Domain | Automated Scope & What Was Covered | Technical & Business Justification (Why Selected) | Risk Tier |
| :--- | :--- | :--- | :---: |
| **Authentication, Session & Security** | • UI login valid/invalid credentials, password masking.<br>• Session cookie lifecycle & HttpOnly extraction.<br>• Programmatic CSRF token parsing from HTML markup.<br>• Maintenance module secondary password re-authentication challenge.<br>• OWASP security response headers & sitemap/asset blocking. | **The Security Gatekeeper**: Complete failure of authentication or CSRF breaks 100% of user access. Secondary password verification on Maintenance prevents unauthorized deletion of employee data. | **P0 (Critical Blocker)** |
| **PIM (Employee Lifecycle Management)** | • End-to-end UI employee onboarding (`/pim/addEmployee`).<br>• Custom vs. auto-generated Employee ID persistence.<br>• Database uniqueness constraints (duplicate ID rejects with `HTTP 422`).<br>• Mutation of employee personal details via `PUT` endpoint.<br>• Rapid programmatic employee seeding (<1.5s vs 12s UI). | **Core HR Transactional Core**: OrangeHRM is an HRIS; employee records are the primary relational entity required by all downstream modules (Leave, Time, Payroll, Admin). | **P0 (Critical Blocker)** |
| **Admin System Users & RBAC Isolation** | • System User creation and role binding (`Admin` vs. `ESS`).<br>• Uniqueness collision gate (`HTTP 422` duplicate username).<br>• Role-based data grid filtering and database tenant isolation.<br>• Idempotency consecutive submission verification. | **Access Governance & Privilege Escalation**: Flaws in RBAC can cause unauthorized privilege escalation or cross-tenant data leakage. | **P0 (Critical Blocker)** |
| **Dashboard & Operational Landing** | • Post-login dashboard landing URL, breadcrumb, and widgets grid.<br>• Direct Quick Launch shortcut routing to Leave & Timesheets.<br>• 'Time at Work' punch-clock widget rendering & stopwatch states.<br>• 'My Actions' pending approvals ledger container.<br>• Employee distribution chart rendering (Sub Unit & Location). | **Operational Command Center**: The primary landing screen after login. Broken shortcut routing or missing widgets prevents daily employee workflows (clocking in, submitting timesheets). | **P1 (Core Operational)** |
| **Directory Search & Fluid Grid** | • Autocomplete employee directory search by name.<br>• Job title filter multi-attribute search.<br>• Responsive card profile rendering.<br>• Boundary condition handling (out-of-range pagination `offset=999999` returns graceful `[]`). | **High-Frequency Read Load**: Employee directory is accessed by all organization members; verifies search indexing and boundary stability. | **P1 (Core Operational)** |
| **Site-Wide Navigation Health Matrix** | • Automated route transitions across **all 12 sidebar modules** (Admin, PIM, Leave, Time, Recruitment, My Info, Performance, Dashboard, Directory, Maintenance, Claim, Buzz).<br>• Validates HTTP 200/201 network responses and DOM heading rendering.<br>• Continuous unbroken 12-module walkthrough in a single session. | **Platform-Wide Smoke Health**: Ensures that route changes, bundle loading, and microservice proxying across all 12 modules function without 404/500 errors. | **P2 (Operational Health)** |
| **AJV JSON Schema Contract Validation** | • Strict JSON Schema (Draft-07) validation on `/dashboard/shortcuts`.<br>• System Users list schema enforcing `data: array`, `meta.total: number`.<br>• **Negative Contract Test (`[SCHEMA-03]`):** Mutates payload (converts numeric total to string, drops `data`) to prove AJV actively catches breaking schema drift.<br>• **Negative Error Contract Test (`[SCHEMA-04]`):** Proves error payloads fail Success Schema while conforming strictly to Error Schema (`error.status: string`, `error.message: string`). | **Microservice Decoupling & Regression Prevention**: Catches backend breaking schema changes before they reach UI layers, eliminating phantom UI bugs. | **P1 (Contract Governance)** |
| **Cross-Browser & Viewport Responsiveness** | • Desktop Cross-Browser Matrix: Chromium, Google Chrome, Microsoft Edge, WebKit (Safari).<br>• Tablet Viewport (iPad 768x1024): Verifies responsive layout and hamburger drawer.<br>• Mobile Viewport (Pixel 7 393x851): Verifies off-canvas navigation drawer, collapsible filter panels, and zero horizontal scroll overflow. | **Device Inclusivity & Field Worker Support**: Modern HR workforce operates on mobile and tablet devices; verifies responsive viewport mechanics without horizontal layout breakages. | **P1 (Cross-Platform)** |

---

## 📑 Table of Contents
1. [Quick Start: Execution & Submission Evaluation Guide](#-1-quick-start-execution--submission-evaluation-guide)
2. [Executive Scope Summary: What Was Covered, Why & Architectural Justification](#-2-executive-scope-summary-what-was-covered-why--architectural-justification)
3. [Core Container Runner & Speed Optimization](#3--core-container-runner--speed-optimization)
4. [Secret Management & Local Setup (.env.test)](#4--secret-management--local-setup-envtest)
5. [AJV JSON Schema Contract Validation (Why & How It Works)](#5--ajv-json-schema-contract-validation-why--how-it-works)
6. [Desktop Cross-Browser Matrix: Chromium, Edge & Safari](#6--desktop-cross-browser-matrix-chromium-edge--safari)
7. [Autonomous Test Planner Generator & Self-Healer CLI](#7--autonomous-test-planner-generator--self-healer-cli)
8. [VS Code Tasks & Debugger Integration](#8--vs-code-tasks--debugger-integration)
9. [Separate Test Execution Strategy (Desktop, Tablet, Mobile, API)](#9--separate-test-execution-strategy-desktop-tablet-mobile-api)
10. [CI/CD Pipeline, Reporting & Artifacts](#10--cicd-pipeline-reporting--artifacts)
11. [Feature Identification Strategy & Scope Justification (Risk-Based Testing Framework)](#11--feature-identification-strategy--scope-justification-risk-based-testing-framework)
    - [Pillar 7: Resilient POM Design & The .or() Fallback Locator Strategy](#-pillar-7-resilient-page-object-model-pom-design--the-or-fallback-locator-strategy)
12. [Requirements Traceability Matrix (RTM) → Test Case Mapping](#12--requirements-traceability-matrix-rtm--test-case-mapping)
    - [Master Summary: UI Pages vs. Background REST API Coverage](#-master-summary-ui-pages-vs-background-rest-api-coverage)
13. [Part 3 Assessment Q&A: Beyond the Brief](#13--part-3-assessment-qa-beyond-the-brief)
14. [Clean Git Push Instructions](#14--clean-git-push-instructions)

---

## 3. ⚡ Core Container Runner & Speed Optimization

The test suite executes inside a containerized runner image from [`rodlesterldizon-collab/core-test-suite`](https://github.com/rodlesterldizon-collab/core-test-suite):

```yaml
container:
  image: ghcr.io/rodlesterldizon-collab/core-test-suite/test-runner:v1.62.1
  credentials:
    username: ${{ github.actor }}
    password: ${{ secrets.CR_PAT }}
  options: --ipc=host
```

### Architectural Performance & Container Optimization
1. **Pre-Compiled Runtime Layers (Zero Download Overhead)**:
   - Eliminates on-demand binary downloads (`npx playwright install --with-deps`) on CI runners.
   - Node.js runtime, browser binaries (Chromium, WebKit, Edge dependencies), and Linux rendering fonts are pre-baked into the container layers, reducing job bootstrap time to **<15 seconds**.
2. **Shared Memory (`--ipc=host`) Multi-Worker Stability**:
   - Standard Docker containers restrict `/dev/shm` to 64MB, causing intermittent renderer crashes under parallel loads.
   - Mounting host shared memory unlocks reliable multi-threaded parallel test execution.
3. **Environment Determinism**:
   - Guarantees complete rendering, font, and runtime parity between local execution and CI/CD pipelines.

---

## 4. 🔐 Secret Management & Local Configuration (`.env.test`)

Local test environment variables and credentials are isolated from source control:

### Local Configuration Setup:
```bash
# Copy template to configure local environment
cp .env.example .env.test
```

Target configuration variables in `.env.test`:
```env
# Target Instance URL
BASE_URL="https://opensource-demo.orangehrmlive.com"

# Administrator Credentials
ADMIN_USERNAME="Admin"
ADMIN_PASSWORD="admin123"

# Local Execution Settings
CI=false
```

### Security Policies:
1. **Source Control Exclusion**: `.env*` and `.env.test` are excluded via `.gitignore`. Only `.env.example` is tracked.
2. **CI Secret Ingestion**: In GitHub Actions (`.github/workflows/playwright.yml`), values are injected directly from repository secrets:
   ```yaml
   SECRET_BASE_URL: ${{ secrets.BASE_URL }}
   SECRET_USERNAME: ${{ secrets.ADMIN_USERNAME }}
   SECRET_PASSWORD: ${{ secrets.ADMIN_PASSWORD }}
   ```

---

## 5. 🛡️ AJV JSON Schema Contract Testing Architecture

### Contract Governance vs. Shallow Assertions
Standard functional assertions (`expect(body.id).toBeDefined()`) only evaluate isolated fields, leaving suites vulnerable to unannounced schema regressions, unexpected type mutations (e.g., numeric IDs returning as strings), or silent drops of nested objects.

To enforce strict API data contracts across the platform, the framework integrates **AJV (Another JSON Schema Validator)** with JSON Schema Draft-07:

```typescript
import Ajv from 'ajv';
const ajv = new Ajv({ allErrors: true, strict: false });

// Validates entire structural contract and types in <2ms
const isValid = ajv.validate(shortcutsResponseSchema, body);
expect(isValid, JSON.stringify(ajv.errors)).toBe(true);
```

### Core Contract Capabilities Enforced:
- **Comprehensive Structure Validation**: Enforces mandatory properties, nested object schemas, and array contracts in a single operation.
- **Contract Drift Detection (`[SCHEMA-03]`)**: Intentionally mutates payloads (type conversions and key removals) to ensure AJV actively flags contract violations.
- **Universal Error Envelope (`[SCHEMA-04]`)**: Validates that HTTP 404 and 422 error payloads strictly adhere to the universal RFC/OrangeHRM error envelope schema (`error.status`, `error.message`).

### Execution Command:
```bash
npm run test:schema
```

---

## 6. 🖥️ Desktop Cross-Browser Matrix: Chromium, Edge & Safari

The suite validates desktop compatibility across three rendering engines using standardized 1280x720 viewports configured in `playwright.config.ts`:

1. **`desktop-chrome`**: Chromium engine (Google Chrome).
2. **`desktop-edge`**: Microsoft Edge distribution (`channel: 'msedge'`).
3. **`desktop-safari`**: WebKit engine (Apple Safari).

### Execution Commands:
```bash
# Run all desktop browsers concurrently
npm run test:desktop:all

# Run individual browser engines
npm run test:chrome
npm run test:edge
npm run test:safari
```

---

## 7. 🤖 Tooling: Test Planner Generator & Locator Self-Healer CLI

The repository provides developer tooling in `tools/` to accelerate test authoring and maintain selector health across UI iterations.

### 1. Test Planner & Boilerplate Generator (`npm run plan:generate`)
Generates structured Markdown Test Plans and strongly typed Playwright test specifications from feature definitions:

```bash
# Generate test plan and spec for a specific feature:
node --experimental-strip-types tools/test-planner.ts --feature="Employee Termination" --module="PIM" --type="e2e"

# Or using the npm shortcut:
npm run plan:generate
```
Artifacts generated:
- `tests/generated/<feature>.plan.md` (RTM requirements, edge cases, RBAC matrices)
- `tests/generated/<feature>.e2e.spec.ts` (Executable Playwright test spec)

### 2. Locator Resilience Auditor & Static Healer (`npm run test:heal`)
Performs offline static Abstract Syntax Tree (AST) analysis across all Page Object Models (`pom/`, `pom/components/`). It scans selectors against fragile anti-patterns (brittle `nth-child` chains, unanchored XPaths, unqualified inputs) and outputs actionable resilience audits without mutating code during test runs:

```bash
npm run test:heal
```
- **Local & Pre-Commit Check**: Run locally or as a pre-commit check to audit Page Object selector health.
- **Audit Artifact Output**: Generates `test-results/healing-report.json` and a console summary report (`100% Locator Resilience`).

---

## 8. 💻 VS Code Tasks & Debugger Integration

The repository includes native VS Code tasks in `.vscode/tasks.json` and debug profiles in `.vscode/launch.json`:

1. Open Command Palette: `Ctrl + Shift + P` (or `Cmd + Shift + P` on macOS).
2. Select **`Tasks: Run Task`**.
3. Choose any predefined workflow:
   - **`Playwright: Run Desktop Cross-Browser (Chrome, Edge, Safari)`**
   - **`Playwright: Run API & AJV Schema Contract Suite`**
   - **`Playwright: Run Tablet Viewport Suite (@tablet)`**
   - **`Playwright: Run Mobile Viewport Suite (@mobile)`**
   - **`AI Tool: Generate Test Plan & Spec Boilerplate`**
   - **`AI Tool: Run Autonomous Test Healer & Locator Audit`**
   - **`Playwright: Open Interactive UI Mode`**
   - **`Playwright: Show HTML Report`**

---

## 9. 🚀 Separate Test Execution Strategy

The suite provides granular execution targets for decoupled CI/CD and local validation:

| Suite / Project | Target Scope | Command | Description |
| :--- | :--- | :--- | :--- |
| **All Tests** | Complete Suite | `npm test` | Runs entire E2E and API catalog |
| **Smoke Suite** | `@smoke` | `npm run test:smoke` | Fast critical path checks (<45s) |
| **Sanity Suite** | `@sanity` | `npm run test:sanity` | Core functional workflows & happy paths |
| **Validation Suite**| `@validation` | `npm run test:validation` | Deep boundary, validation & negative edge cases |
| **Security Suite** | `@security` | `npm run test:security` | Auth gates, RBAC, DoS, OWASP headers & isolation |
| **Desktop Cross-Browser** | Chrome, Edge, Safari | `npm run test:desktop:all` | 1280x720 cross-browser matrix |
| **Tablet Viewport** | iPad (768x1024) | `npm run test:tablet` | Verifies hamburger navigation & drawer |
| **Mobile Viewport** | Pixel 7 (393x851) | `npm run test:mobile` | Validates mobile responsive layout & touch |
| **REST API & Schema** | Backend Endpoints | `npm run test:api` | Fast headless contract validation (<15s) |
| **Sidebar Navigation (P2)** | All 12 Modules UI + API | `npm run test:nav` | Validates all 12 sidebar links, HTTP 200 & DOM |
| **Dashboard Widgets Suite** | Widgets & Shortcuts | `npm run test:dashboard` | Deep UI test of Quick Launch, Time at Work, Charts |
| **Maintenance Suite** | Purge & Access Records | `npm run test:maintenance` | Admin verification, purge records & download personal data |
| **AJV Schema Only** | JSON Schemas | `npm run test:schema` | Strict contract validation |
| **Interactive UI Mode** | Visual Debugger | `npm run test:ui` | Playwright interactive time-travel UI |
| **HTML Report** | Test Summary | `npm run report` | Opens HTML test report in browser |

---

## 10. 📊 CI/CD Pipeline, Reporting & Artifacts

The GitHub Actions workflow (`.github/workflows/playwright.yml`) executes on push and pull requests with the following pipeline architecture:

1. **Parallel Containerized Jobs**:
   - `api-tests`: REST API & AJV Schema validation.
   - `desktop-e2e`: Desktop cross-browser matrix across Chrome, Edge, and Safari.
   - `tablet-e2e`: iPad responsive layout testing (`@tablet`).
   - `mobile-e2e`: Pixel 7 mobile responsive testing (`@mobile`).
2. **Consolidated Executive Reporting**:
   - `qa-pipeline-reporting` aggregates results into an executive Markdown summary in `$GITHUB_STEP_SUMMARY`.
3. **Artifact Retention**:
   - Uploads Playwright HTML reports (`playwright-report/`) to GitHub Artifacts with **14-day retention**.
   - Inspect locally: `npx playwright show-report <path>`.

### 🎛️ 10.1 CI/CD Failure Artifacts & Media Capture Toggles

Failure media recording (screenshots, session videos, and DOM traces) is configurable via environment variables without modifying test code:

| Setting / Env Variable | Supported Values | Default | Purpose |
| :--- | :--- | :---: | :--- |
| **`PLAYWRIGHT_SCREENSHOT`** | `'off'`, `'only-on-failure'`, `'on'` | `'off'` | Captures full-page screenshot on test failure. |
| **`PLAYWRIGHT_VIDEO`** | `'off'`, `'retain-on-failure'`, `'on'` | `'off'` | Records browser session video for failed tests. |
| **`PLAYWRIGHT_TRACE`** | `'off'`, `'on-first-retry'`, `'retain-on-failure'`, `'on'` | `'off'` | Records time-travel DOM, network, and console traces. |

#### Environment Configuration (`.env` or CI Secrets):
```properties
# Enable failure diagnostics:
PLAYWRIGHT_SCREENSHOT="only-on-failure"
PLAYWRIGHT_VIDEO="retain-on-failure"
PLAYWRIGHT_TRACE="on-first-retry"

# Optimized default for execution speed:
PLAYWRIGHT_SCREENSHOT="off"
PLAYWRIGHT_VIDEO="off"
PLAYWRIGHT_TRACE="off"
```

#### Programmatic Configuration (`playwright.config.ts`):
```typescript
use: {
  screenshot: 'off', // 'off' | 'only-on-failure' | 'on'
  video: 'off',      // 'off' | 'retain-on-failure' | 'on'
  trace: 'off',      // 'off' | 'on-first-retry' | 'retain-on-failure' | 'on'
}
```

---

## 11. 🧭 Feature Identification Strategy & Scope Justification (Risk-Based Testing Framework)

To maximize test reliability and regression safety across an enterprise HRMS platform, test scope was selected using a **5-Pillar Risk-Based Testing (RBT) Framework**, prioritizing critical business risk over superficial UI coverage:

```
                  ┌────────────────────────────────────────────────────────┐
                  │ 5-Pillar QA Feature Identification & Scope Framework   │
                  └────────────────────────────────────────────────────────┘
                                              │
         ┌────────────────────┬───────────────┴───────────────┬────────────────────┐
         ▼                    ▼                               ▼                    ▼
   [Pillar 1]           [Pillar 2]                      [Pillar 3]           [Pillar 4]
 Core Business      Network Reverse Eng.             Risk-Based Matrix      State Mutations
  Criticality       & REST API Mapping               (Impact x Prob.)       & Idempotency
         │                    │                               │                    │
         ▼                    ▼                               ▼                    ▼
   Auth, PIM,           /api/v2/* Schema                P0: Auth/Collision   Duplicate POST 422,
   Admin RBAC           AJV JSON Contracts             P1: Role Leakage     Dynamic Teardown
                                              │
                                              ▼
                                         [Pillar 5]
                                    Security & Upstream Defect
                                    (401/403/429 Gates,
                                    Captured 500 Defect)
```

---

### 🏛️ Pillar 1: Business Criticality & Core User Journeys
OrangeHRM is an **Enterprise Human Resource Management System (HRMS)**. The system's value proposition depends on **identity access management, employee record integrity, and organizational governance**. If these fail, downstream operations (payroll, benefits, performance reviews) completely collapse.

1. **Authentication & Session Lifecycle (Tier 1 - Highest Criticality)**:
   - *Rationale*: The authentication gateway protects sensitive employee PII and organizational data. A failure blocks access across all modules.
   - *Scope Selected*: Login redirect, SameSite HttpOnly cookie persistence, CSRF validation, invalid credential rejection, and secure logout.
2. **PIM (Personnel Information Management - Core Transactional Engine)**:
   - *Rationale*: The employee database is the primary relational entity required by downstream modules (Leave, Time, Claims, Performance).
   - *Scope Selected*: Auto vs Custom ID generation, DB uniqueness constraints (`422 Unprocessable Entity`), Personal Details mutation (`PUT /personal-details`), and search/autocomplete filtering.
3. **Admin & RBAC (Role-Based Access Control)**:
   - *Rationale*: Access control enforcement prevents privilege escalation and cross-role data leakage.
   - *Scope Selected*: System User creation, role-based filtering isolation, and collision prevention.
4. **Corporate Directory**:
   - *Rationale*: High-frequency organizational lookups across active personnel.
   - *Scope Selected*: Grid card rendering, job title filtering, search reset, and zero-result empty state.

---

### 📡 Pillar 2: Network Traffic Reverse Engineering & REST API Mapping
Modern web applications are Single Page Applications (SPAs). Automating solely through the UI creates slow, brittle test suites and misses the underlying API contracts.
- **Methodology**: Inspected Google Chrome DevTools Network Tab (XHR/Fetch) across every user journey.
- **Findings**:
  - Mapped internal REST endpoints under `/web/index.php/api/v2/*` (`/pim/employees`, `/admin/users`, `/dashboard/shortcuts`, `/dashboard/employees/action-summary`, `/leave/reports/data`, `/recruitment/candidates`, `/claim/requests`, `/buzz/feed`).
  - Identified CSRF token mechanics: `:token="&quot;...&quot;"` embedded in HTML templates and passed via form bodies.
- **Justification**:
  - Validates that backend database constraints (uniqueness, foreign keys, mandatory validations) are enforced at the API layer independently of UI client-side validation.
  - Enabled **fast precondition seeding (<1.5s)** for UI tests instead of slow UI form fills.

---

### ⚖️ Pillar 3: Risk-Based Testing Matrix (Impact vs. Probability)

| Risk Classification | Business Impact | Probability of Defect | Testing Strategy & Priority | Features Covered |
| :--- | :---: | :---: | :--- | :--- |
| **Catastrophic (P0)** | Critical | High | Automated in `@smoke` & `@sanity`; blocked CI gate. | Authentication, Employee Seeding, User Creation, CSRF Gate. |
| **High (P1)** | Severe | Medium | Full API contract validation with AJV Schema; negative paths. | Duplicate Username/ID constraints, Role data isolation, Personal Details updates, Leave Reports. |
| **Medium (P2)** | Moderate | Low | Boundary validations, responsive viewport fluidity, health matrix. | Out-of-range pagination offsets, sidebar 12-module route health, mobile drawer navigation, rate-limiting (429). |

---

### 🔄 Pillar 4: State Mutations, Idempotency & Clean Teardown
Enterprise applications frequently suffer from double-click submission bugs, race conditions, and test data pollution.
- **Idempotency Verification**: Tested duplicate POST payloads to `POST /api/v2/admin/users` to verify the second submission is rejected with `HTTP 422 ("Already exists")`.
- **Dynamic Teardown**: Every automated user creation (`[TC-API-12]`, `[TC-API-33]`) dynamically queries an existing `empNumber` and implements a `finally { await request.delete(...) }` block to guarantee zero stale records remain on the shared demo server across parallel test runs.

---

### 🛡️ Pillar 5: Security Posture, Boundary Analysis & Defect Discovery
A robust QA automation suite actively validates security boundaries and edge-case handling:
1. **Re-Authentication Gates**: Validated that sensitive actions (Maintenance Purge Employee) require password re-entry and reject invalid attempts with `401 Unauthorized`.
2. **Access Control on Sensitive Assets**: Validated that `/sitemap.xml`, `/.env`, and `/.git` are blocked with `403 Forbidden` or `404 Not Found`.
3. **Rate Limiting Resilience**: Burst testing (15 concurrent requests) ensuring the server handles traffic with `200` or `429 Too Many Requests` without crashing with `500`.
4. **Upstream Defect Discovery**:
   - **Discovered Bug**: When submitting an empty email on `POST /api/v2/recruitment/candidates`, the OrangeHRM backend throws an unhandled `HTTP 500 Internal Server Error` instead of a standard `422 Unprocessable Entity`.
   - **Handling**: Tagged with Playwright `testInfo.annotations.push({ type: 'fixme', ... })` and tolerant assertion `[422, 500]` to report and monitor the upstream bug while maintaining a green CI pipeline.

---

### 🧩 Pillar 6: Supplemental Test Strategy & Scope Expansion Justification

To provide robust, long-term enterprise regression safety, **Supplemental Test Suites** were introduced. These tests expand coverage beyond basic transactional workflows into operational, navigation, and platform-wide system health:

| Supplemental Suite | Target Files | Priority Tier | Why Selected & Technical Justification | What Happens If Not Covered? |
| :--- | :--- | :---: | :--- | :--- |
| **Dashboard Widgets & Shortcuts** | `tests/e2e/dashboard.spec.ts` | **P0/P1/P2** | **Operational Landing**: Post-login landing zone. Validates that Quick Launch buttons directly route to Leave and Timesheets, while Time at Work, My Actions, and charts hydrate properly without manual page reloads. | Broken shortcut routing; broken dashboard analytics; delayed employee actions. |
| **12-Module Sidebar Health Matrix** | `tests/e2e/sidebar-navigation.spec.ts` | **P2** | **Site-Wide Navigation Health**: Validates that all 12 sidebar modules (Admin, PIM, Leave, Time, Recruitment, My Info, Performance, Dashboard, Directory, Maintenance, Claim, Buzz) load without 404s, return HTTP 200/201, and render expected DOM headings. Ranked as **P2** because it validates route transitions rather than deep transactional mutations. | Undetected broken links, routing regression after microservice deployments, or broken layouts. |
| **Maintenance Verification & Purge** | `tests/e2e/maintenance.spec.ts` | **P1/P2** | **Intermediary Security Challenge**: Validates OrangeHRM's secondary password prompt on sensitive administrative sub-modules before accessing Purge Employee Records, Access Personal Data, and Purge Candidate Records. | Security bypasses on sensitive data deletion gates; UI freezing during secondary challenge. |

All supplemental tests are strictly mapped to the **Requirements Traceability Matrix (RTM)** below with explicit functional requirements (`FR-DSH-*`, `FR-NAV-*`, `FR-MNT-*`).

---

### 🏗️ Pillar 7: Resilient Page Object Model (POM) Design & Multi-Tiered Locators

In enterprise Single Page Applications (SPAs) built with modern component frameworks (Vue.js / `@oxd`), DOM trees experience dynamic hydration phases, accessibility role assignment latency, and viewport-driven structural mutations.

To guarantee locator stability without introducing arbitrary sleep delays, the framework employs Playwright's **`.or()` locator union pattern** (`locator.or(locator)`).

#### Architectural Rationale for Multi-Tiered Locators:
- **Asynchronous Hydration & ARIA Timing**: During SPA route transitions, elements frequently mount with raw HTML tags (`<h6>`, `<h5>`, `<div>`) milliseconds before the browser's accessibility tree assigns computed roles (`heading`, `menuitem`).
- **Dynamic CSS Suffixes & BEM Variations**: Component styling uses suffix or substring matching (e.g., `[class$="card-container"]` or `.orangehrm-background-container`).
- **Responsive Viewport Polymorphism**: In desktop view, an item might render as a topbar tab link (`.oxd-topbar-body-nav-tab-link`), whereas in tablet/mobile or dropdown states, it renders as a dropdown item (`ul li a` or `menuitem`).

#### Fallback Hierarchy in Page Objects:
1. **Primary Tier**: Accessible, user-facing semantic role (`getByRole`).
2. **Secondary Tier**: Semantic HTML tag filtered by exact user text (`h6, h5`, `ul li a`).
3. **Tertiary Tier**: Structural/CSS attribute selector (`[class$="card-container"]`, `.oxd-topbar-body-nav-tab`).

**Implementation Example (`MaintenancePage.ts`)**:
```typescript
// Card container with class-suffix regex fallback
this.maintenanceContainer = this.page.locator('[class$="card-container"]')
  .or(this.page.locator('.orangehrm-background-container'))
  .first();

// Header with ARIA role primary and semantic tag fallback
this.purgeRecordsHeader = this.page.getByRole('heading', { name: 'Purge Employee Records' })
  .or(this.page.locator('h6, h5').filter({ hasText: 'Purge Employee Records' }));

// Dropdown item with semantic hierarchy: list link -> ARIA menuitem -> component class
this.purgeCandidateRecord = this.page.locator('ul li a').filter({ hasText: 'Candidate Records' })
  .or(this.page.getByRole('menuitem', { name: 'Candidate Records' }))
  .or(this.page.locator('.oxd-topbar-body-nav-tab-link').filter({ hasText: 'Candidate Records' }));
```

#### Reliability & Governance Principles:
1. **Native Playwright Integration**: Utilizes Playwright's built-in `locator.or()` to resolve transient DOM states without branching `try/catch` logic or conditional polling.
2. **Accessibility-First Discipline**: Prioritizes semantic user-facing roles (`getByRole`) as the primary target, invoking tag/class fallbacks only if the primary selector cannot resolve within Playwright's auto-wait window.
3. **Strict-Mode Safety (`.first()`)**: Enforces `.first()` or `.filter({ hasText: ... })` to prevent strict-mode ambiguity errors.
4. **Resilience to Theme/Hydration Drift**: Protects tests from breaking when upstream UI component updates modify minor class naming or hydration timings.

---

## 12. 📋 Requirements Traceability Matrix (RTM) → Test Case Mapping

Below is the complete cross-reference matrix linking every automated UI, Responsive, API, and Schema test to its corresponding **OrangeHRM Functional Requirement (FR)** and **System Specification (SS)**:

### 📱 12.1 User Interface (UI) & End-to-End (E2E) Test Suite

| Test ID | Module | Business Function / Requirement | Scenario & Verification Target | Viewport / Tags | Automation File | POM / Component Reference |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-UI-01** | **Auth** | **FR-AUTH-01:** Admin Authentication & Dashboard Routing | Valid administrator credentials submit successfully, redirect to `/dashboard/index`, and render Topbar breadcrumb and user profile menu. | Desktop, Tablet, Mobile<br>`@smoke` `@sanity` | `tests/e2e/auth.spec.ts` | `LoginPage.ts`<br>`Navbar.ts` |
| **TC-UI-02** | **Auth** | **FR-AUTH-02:** Credential Failure & Error Banners | Submitting invalid password triggers error alert banner containing *"Invalid credentials"* and retains user on `/auth/login`. | Desktop, Tablet, Mobile<br>`@smoke` `@security` | `tests/e2e/auth.spec.ts` | `LoginPage.ts` |
| **TC-UI-03** | **Auth** | **FR-AUTH-03:** Mandatory Field Validation | Submitting empty form highlights username and password fields with inline *"Required"* error tags. | Desktop<br>`@validation` | `tests/e2e/auth.spec.ts` | `LoginPage.ts` |
| **TC-UI-04** | **Auth** | **FR-AUTH-04:** Session Termination & Logout | Pre-authenticated user opens topbar profile dropdown, clicks *Logout*, and is redirected back to `/auth/login` with session cleared. | Desktop, Tablet, Mobile<br>`@sanity` | `tests/e2e/auth.spec.ts` | `DashboardPage.ts`<br>`Navbar.ts` |
| **TC-UI-09** | **PIM** | **FR-PIM-01:** Employee Provisioning (Auto ID) | Adding employee with generated first/last names and auto-assigned ID redirects to `/pim/viewPersonalDetails` with *"Successfully Saved"* toast. | Desktop<br>`@smoke` `@sanity` | `tests/e2e/pim.spec.ts` | `PimPage.ts`<br>`BasePage.ts` |
| **TC-UI-10** | **PIM** | **FR-PIM-02:** Employee Provisioning (Custom Unique ID) | Adding employee with custom alphanumeric ID (`E#####`) persists custom ID without collision. | Desktop<br>`@sanity` | `tests/e2e/pim.spec.ts` | `PimPage.ts` |
| **TC-UI-11** | **PIM** | **FR-PIM-03:** Form Validation Flags | Attempting to save new employee without mandatory First Name and Last Name displays inline *"Required"* validation flags. | Desktop<br>`@validation` | `tests/e2e/pim.spec.ts` | `PimPage.ts` |
| **TC-UI-12** | **PIM** | **FR-PIM-04:** Employee Autocomplete Search | Typing employee name in search field populates autocomplete options; selecting and searching isolates matching employee record in data table. | Desktop<br>`@sanity` | `tests/e2e/pim.spec.ts` | `PimPage.ts` |
| **TC-UI-14** | **PIM** | **FR-PIM-05:** Search Filter Reset | Resetting an empty or filtered search restores full employee record counter matching `/(.*)Records? Found/i` and multiple data rows. | Desktop<br>`@validation` | `tests/e2e/pim.spec.ts` | `PimPage.ts` |
| **TC-UI-15** | **Admin** | **FR-ADM-01:** System Users Data Grid Schema | System Users table (`/admin/viewSystemUsers`) renders columns: *Username*, *User Role*, *Employee Name*, *Status*, and *Actions*. | Desktop<br>`@smoke` | `tests/e2e/admin.spec.ts` | `AdminPage.ts` |
| **TC-UI-16** | **Admin** | **FR-ADM-02:** User Provisioning with Role Assignment | Adding system user with selected Role (*Admin*), linked Employee autocomplete, and enabled Status saves successfully with confirmation toast. | Desktop<br>`@sanity` | `tests/e2e/admin.spec.ts` | `AdminPage.ts` |
| **TC-UI-18** | **Admin** | **FR-ADM-03:** Duplicate Username Collision Rejection | Entering an existing username (`Admin`) triggers live blur validation error *"Already exists"*. | Desktop<br>`@validation` | `tests/e2e/admin.spec.ts` | `AdminPage.ts` |
| **TC-UI-19** | **Admin** | **FR-ADM-04:** Role-Based Data Isolation Filter | Filtering system users by role (*Admin*) intercepts GET `/api/v2/admin/users`, clears spinner, and verifies all rendered rows display role *"Admin"*. | Desktop<br>`@sanity` | `tests/e2e/admin.spec.ts` | `AdminPage.ts` |
| **TC-UI-21** | **Directory** | **FR-DIR-01:** Corporate Directory Grid Rendering | Directory page (`/directory/viewDirectory`) displays records counter matching `/(.*)Records? Found/i` and employee card grid. | Desktop<br>`@smoke` | `tests/e2e/directory.spec.ts` | `DirectoryPage.ts` |
| **TC-UI-22** | **Directory** | **FR-DIR-02:** Directory Name Search Autocomplete | Searching for employee name via autocomplete dropdown filters down directory card grid to matching profile cards. | Desktop<br>`@sanity` | `tests/e2e/directory.spec.ts` | `DirectoryPage.ts` |
| **TC-UI-23** | **Directory** | **FR-DIR-03:** Job Title Filter & HTTP Contract | Selecting Job Title (*Chief Financial Officer*) intercepts GET `/api/v2/directory/employees` (HTTP 200) and asserts card contains title. | Desktop<br>`@validation` | `tests/e2e/directory.spec.ts` | `DirectoryPage.ts` |
| **TC-UI-24** | **Directory** | **FR-DIR-04:** Filter Reset & Counter Restoration | Filtering and subsequent reset restores directory card grid and record counter to original total. | Desktop<br>`@validation` | `tests/e2e/directory.spec.ts` | `DirectoryPage.ts` |
| **TC-UI-25** | **Directory** | **FR-DIR-05:** Zero Results Empty State | Filtering by mutually exclusive criteria (*HR Manager* + *Canadian Regional HQ*) displays *"No Records Found"* indicator and 0 cards. | Desktop<br>`@validation` | `tests/e2e/directory.spec.ts` | `DirectoryPage.ts` |
| **TC-UI-25** | **Responsive** | **FR-RSP-01:** Mobile Drawer Navigation & Desktop Sidebar Collapse | Mobile/tablet: verifies hamburger button opens navigation drawer and routes to PIM.<br>Desktop: verifies sidebar toggle button collapses/expands sidebar (`.toggled` class check). | Desktop, Tablet, Mobile<br>`@validation` `@tablet` `@mobile` | `tests/e2e/responsive.spec.ts` | `DashboardPage.ts`<br>`Navbar.ts`<br>`Sidebar.ts` |
| **TC-UI-26** | **Responsive** | **FR-RSP-02:** Dashboard Viewport Overflow Adaptability | Validates dashboard widgets and quick launch adapt to screen boundaries without triggering horizontal scrollbar overflow. | Tablet, Mobile<br>`@validation` `@tablet` `@mobile` | `tests/e2e/responsive.spec.ts` | `DashboardPage.ts`<br>`Navbar.ts` |
| **TC-UI-27** | **Responsive** | **FR-RSP-03:** Directory Grid Mobile Fluidity & Collapsible Filter | Validates directory filter form and card grid adapt fluidly without horizontal clipping; handles and expands collapsed search filter panel (`directorySearchToggle`). | Tablet, Mobile<br>`@validation` `@tablet` `@mobile` `@responsive` | `tests/e2e/responsive.spec.ts` | `DirectoryPage.ts` |
| **TC-UI-06** | **Dashboard** | **FR-DSH-01:** Dashboard Landing URL, Title & Main Widgets Grid | Verifies landing on `/dashboard/index`, Topbar Breadcrumb 'Dashboard', and core widgets rendered. | Desktop<br>`@smoke` `@sanity` `@p0` `@dashboard` | `tests/e2e/dashboard.spec.ts` | `DashboardPage.ts` |
| **TC-UI-07** | **Dashboard** | **FR-DSH-02:** Quick Launch Shortcut to Assign Leave | Clicking 'Assign Leave' button navigates directly to `/leave/assignLeave` with breadcrumb update. | Desktop<br>`@sanity` `@p1` `@dashboard` `@leave` | `tests/e2e/dashboard.spec.ts` | `DashboardPage.ts` |
| **TC-UI-08** | **Dashboard** | **FR-DSH-03:** Quick Launch Shortcut to Timesheets | Clicking 'Timesheets' button navigates directly to `/time/` module with breadcrumb update. | Desktop<br>`@sanity` `@p1` `@dashboard` `@time` | `tests/e2e/dashboard.spec.ts` | `DashboardPage.ts` |
| **TC-UI-36** | **Dashboard** | **FR-DSH-04:** Time at Work Widget Attendance Punch Card State | Verifies 'Time at Work' widget header, stopwatch icon, and attendance action card are rendered. | Desktop<br>`@validation` `@p2` `@dashboard` | `tests/e2e/dashboard.spec.ts` | `DashboardPage.ts` |
| **TC-UI-37** | **Dashboard** | **FR-DSH-05:** My Actions Widget Pending Items Ledger | Verifies 'My Actions' widget header card and pending action items or empty state container. | Desktop<br>`@validation` `@p2` `@dashboard` | `tests/e2e/dashboard.spec.ts` | `DashboardPage.ts` |
| **TC-UI-38** | **Dashboard** | **FR-DSH-06:** Employee Distribution Charts Presence | Verifies presence of Sub Unit and Location employee distribution chart cards. | Desktop<br>`@validation` `@p2` `@dashboard` | `tests/e2e/dashboard.spec.ts` | `DashboardPage.ts` |
| **TC-UI-39** | **Dashboard** | **FR-DSH-07:** Top Navigation Profile Dropdown Menu from Dashboard | Opens topbar profile dropdown from dashboard; verifies About, Support, Change Password, Logout. | Desktop<br>`@sanity` `@p1` `@dashboard` `@auth` | `tests/e2e/dashboard.spec.ts` | `DashboardPage.ts`<br>`Navbar.ts` |
| **TC-NAV-01 to 12** | **Navigation** | **FR-NAV-01 to 12:** All 12 Sidebar Module Route Transitions & HTTP 200/201 | Validates that clicking each of the 12 sidebar links (Admin, PIM, Leave, Time, Recruitment, My Info, Performance, Dashboard, Directory, Maintenance with secondary password re-auth, Claim, Buzz) transitions URL, renders topbar, and returns HTTP 200/201. | Desktop<br>`@p2` `@navigation` | `tests/e2e/sidebar-navigation.spec.ts` | `Sidebar.ts`<br>`DashboardPage.ts` |
| **TC-NAV-ALL** | **Navigation** | **FR-NAV-13:** Unified Full Sidebar Navigation Walkthrough | Continuous single-session sequential walkthrough of all 12 modules asserting unbroken session, UI loading, and network 200/201 responses. | Desktop<br>`@p2` `@navigation` `@smoke` | `tests/e2e/sidebar-navigation.spec.ts` | `Sidebar.ts`<br>`DashboardPage.ts` |
| **TC-MAINT-01** | **Maintenance** | **FR-MNT-01:** Administrator Verification & Purge Records Landing | Verifies landing on `/maintenance/purgeEmployee`, card container, Purge Employee Records header, and navigation tabs. | Desktop<br>`@smoke` `@p1` `@maintenance` | `tests/e2e/maintenance.spec.ts` | `MaintenancePage.ts` |
| **TC-MAINT-02** | **Maintenance** | **FR-MNT-02:** Access Records Tab Navigation & Header Update | Clicks Access Records tab; verifies URL transition to `/maintenance/accessEmployeeData` and header 'Download Personal Data'. | Desktop<br>`@sanity` `@p2` `@maintenance` | `tests/e2e/maintenance.spec.ts` | `MaintenancePage.ts` |
| **TC-MAINT-03** | **Maintenance** | **FR-MNT-03:** Purge Candidate Records Dropdown Navigation | Opens Purge Records dropdown, selects Candidate Records; verifies URL `/maintenance/purgeCandidateData` and header. | Desktop<br>`@sanity` `@p2` `@maintenance` | `tests/e2e/maintenance.spec.ts` | `MaintenancePage.ts` |

---

### ⚡ 12.2 REST API, Security & Contract Test Suite (Happy & Sad Path Matrix)

| Test ID | Module | Business Function / Requirement | Scenario & Verification Target | SLA / Status | Tags / Priority | Automation File |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-API-01** | **API Auth** | **FR-API-01:** Programmatic Login & CSRF Lifecycle | Extracts CSRF token from login HTML, submits credentials to `/auth/validate`, asserts HTTP 302 redirect, and validates `orangehrm` HttpOnly SameSite cookie. | HTTP 302<br>Latency < 2.5s | `@smoke` `@sanity`<br>**P0 (Core)** | `tests/api/auth.api.spec.ts` |
| **TC-API-02** | **API Auth** | **FR-API-02:** Unauthorized Credential Rejection | Submitting incorrect password fails authentication and redirects back to `/auth/login`. | HTTP 302 (Login URI) | `@security`<br>**P0 (Core)** | `tests/api/auth.api.spec.ts` |
| **TC-API-03** | **API Auth** | **FR-API-03:** Blank Credentials Rejection | Submitting empty username and password fails authentication and redirects to `/auth/login`. | HTTP 302 (Login URI) | `@validation`<br>**P1 (Negative)** | `tests/api/auth.api.spec.ts` |
| **TC-API-04** | **API Auth** | **FR-API-04:** Programmatic Logout & Session Invalidation | Requesting GET `/auth/logout` terminates active session and redirects to `/auth/login`. | HTTP 302 | `@sanity`<br>**P1 (Core)** | `tests/api/auth.api.spec.ts` |
| **TC-API-05** | **API Dir** | **FR-API-05:** Dashboard Quick Launch Shortcuts | Validates GET `/api/v2/dashboard/shortcuts` endpoint returns valid data payload object. | HTTP 200 | `@smoke`<br>**P1 (Core)** | `tests/api/directory.api.spec.ts` |
| **TC-API-06** | **API PIM** | **FR-API-06:** Rapid Employee Precondition Seeding | Posts new employee payload to `/api/v2/pim/employees` in <1.5s, returning employee number and ID (used for fast test seeding). | HTTP 200/201<br>Latency < 1.5s | `@smoke` `@sanity`<br>**P0 (Core)** | `tests/api/pim.api.spec.ts` |
| **TC-API-07** | **API PIM** | **FR-API-07:** Custom Employee ID Schema Contract | Validates POST `/api/v2/pim/employees` accepts and persists custom `employeeId`. | HTTP 200/201 | `@sanity`<br>**P0 (Core)** | `tests/api/pim.api.spec.ts` |
| **TC-API-08** | **API PIM** | **FR-API-08:** DB Uniqueness Constraint on Employee ID | Attempting to create a second employee with an identical `employeeId` triggers HTTP 422/409 validation rejection. | HTTP 422 / 409 | `@validation`<br>**P1 (Negative)** | `tests/api/pim.api.spec.ts` |
| **TC-API-09** | **API PIM** | **FR-API-09:** Employee List Pagination Contract | Validates GET `/api/v2/pim/employees?limit=10&offset=0` contains `data` array and `meta.total` count. | HTTP 200 | `@sanity`<br>**P1 (Core)** | `tests/api/pim.api.spec.ts` |
| **TC-API-10** | **API PIM** | **FR-API-10:** Missing Mandatory Names Validation | Attempting to create an employee with missing mandatory first/last names triggers HTTP 422. | HTTP 422 | `@validation`<br>**P1 (Negative)** | `tests/api/pim.api.spec.ts` |
| **TC-API-11** | **API Admin** | **FR-API-11:** System Users List Contract | Validates GET `/api/v2/admin/users` returns list of user entities with `userName`, `userRole`, and `status`. | HTTP 200 | `@smoke`<br>**P0 (Core)** | `tests/api/admin.api.spec.ts` |
| **TC-API-12** | **API Admin** | **FR-API-12:** Programmatic System User Creation | Posts new system user payload with role ID 1 (Admin) and verifies created username. | HTTP 200/201 | `@sanity`<br>**P1 (Core)** | `tests/api/admin.api.spec.ts` |
| **TC-API-13** | **API Admin** | **FR-API-13:** Duplicate Username DB Constraint | Attempting to create a system user with existing username (`Admin`) triggers HTTP 422 error. | HTTP 422 | `@validation`<br>**P1 (Negative)** | `tests/api/admin.api.spec.ts` |
| **TC-API-14** | **API Admin** | **FR-API-14:** Role ID Database Isolation Query | Validates GET `/api/v2/admin/users?userRoleId=1` returns only users where `userRole.id === 1`. | HTTP 200 | `@validation`<br>**P1 (Core)** | `tests/api/admin.api.spec.ts` |
| **TC-API-15** | **API Dir** | **FR-API-15:** Directory Employee Card Contract | Validates GET `/api/v2/directory/employees` returns employee cards with `firstName` and `lastName`. | HTTP 200 | `@sanity`<br>**P1 (Core)** | `tests/api/directory.api.spec.ts` |
| **TC-API-16** | **API Admin** | **FR-API-16:** Missing Mandatory User Fields Validation | Attempting to create a system user without username/password triggers HTTP 422. | HTTP 422 | `@validation`<br>**P1 (Negative)** | `tests/api/admin.api.spec.ts` |
| **TC-API-17** | **API PIM** | **FR-API-17:** Update Personal Details PUT Contract | Updates employee personal details via `PUT /api/v2/pim/employees/{empNumber}/personal-details` and validates persisted attributes. | HTTP 200 | `@sanity`<br>**P1 (Core)** | `tests/api/pim.api.spec.ts` |
| **TC-API-18** | **API PIM** | **FR-API-18:** Update Non-Existent Personal Details Rejection | Attempting to update personal details for non-existent employee ID returns HTTP 404/422. | HTTP 404 / 422 | `@validation`<br>**P2 (Negative)** | `tests/api/pim.api.spec.ts` |
| **TC-API-19** | **API Leave**| **FR-API-19:** Leave Balance Report Generation Contract | Validates GET `/api/v2/leave/reports/data` returns structured leave entitlement balances for active period. | HTTP 200 | `@sanity`<br>**P1 (Core)** | `tests/api/leave.api.spec.ts` |
| **TC-API-20** | **API Leave**| **FR-API-20:** Leave Report Invalid Identifier Rejection | Requesting leave report with invalid definition name or malformed dates returns HTTP 422/404/400. | HTTP 422 / 404 / 400 | `@validation`<br>**P2 (Negative)** | `tests/api/leave.api.spec.ts` |
| **TC-API-21** | **API Leave**| **FR-API-21:** Leave Types List for Assign Leave Contract | Validates GET `/api/v2/leave/leave-types` returns active leave entitlement types. | HTTP 200 | `@sanity`<br>**P1 (Core)** | `tests/api/leave.api.spec.ts` |
| **TC-API-22** | **API Sec** | **FR-API-22:** Maintenance Purge Authorization Gate | Unauthorized POST to `/api/v2/maintenance/purge/validate-password` with incorrect password is rejected with 401/403. | HTTP 401 / 403 | `@security`<br>**P1 (Security)** | `tests/api/security.api.spec.ts` |
| **TC-API-23** | **API Sec** | **FR-API-23:** CSRF Token Forgery Rejection Gate | Submitting login credentials with invalid/forged `_token` fails authentication gate. | HTTP 302 / 419 | `@security`<br>**P2 (Security)** | `tests/api/auth.api.spec.ts` |
| **TC-API-24** | **API Rec** | **FR-API-24:** Create Recruitment Candidate Contract | Posts new candidate payload to `POST /api/v2/recruitment/candidates` and validates created candidate entity. | HTTP 200/201 | `@sanity`<br>**P1 (Core)** | `tests/api/recruitment.api.spec.ts` |
| **TC-API-25** | **API Rec** | **FR-API-25:** Candidate Email Format Validation Rejection | Creating a candidate with malformed email triggers HTTP 422 Unprocessable Entity. | HTTP 422 | `@validation`<br>**P2 (Negative)** | `tests/api/recruitment.api.spec.ts` |
| **TC-API-26** | **API Rec** | **FR-API-26:** Candidate Missing Mandatory Email Rejection | Creating a candidate without required email address triggers HTTP 422. | HTTP 422 | `@validation`<br>**P1 (Negative)** | `tests/api/recruitment.api.spec.ts` |
| **TC-API-27** | **API Claim**| **FR-API-27:** Claim Requests Default Search Contract | Validates GET `/api/v2/claim/requests?limit=50&offset=0` returns claim records list. | HTTP 200 | `@sanity`<br>**P1 (Core)** | `tests/api/modules.api.spec.ts` |
| **TC-API-28** | **API Buzz** | **FR-API-28:** Buzz Newsfeed Stream API Contract | Validates GET `/api/v2/buzz/feed?limit=10&offset=0` returns active social stream posts. | HTTP 200 | `@sanity`<br>**P1 (Core)** | `tests/api/modules.api.spec.ts` |
| **TC-API-29** | **API Maint**| **FR-API-29:** Maintenance Purge Employee Page State Check | Verifies GET `/maintenance/purgeEmployee` loads valid HTML state for authenticated user. | HTTP 200 | `@sanity`<br>**P2 (Health)** | `tests/api/modules.api.spec.ts` |
| **TC-API-30** | **API Health**| **FR-API-30:** Sidebar Navigation Health Matrix (12 Modules) | Verifies all 12 core sidebar routes (Admin, PIM, Leave, Time, Recruitment, My Info, Performance, Dashboard, Directory, Maintenance, Claim, Buzz) load HTTP 200. | HTTP 200 across 12 endpoints | `@smoke`<br>**P2 (Health)** | `tests/api/modules.api.spec.ts` |
| **TC-API-31** | **API Dir** | **FR-API-31:** Directory Search Out-of-Range Offset Boundary | Requests directory employees with high offset (`offset=999999`) and validates graceful 0-item response array. | HTTP 200 (`data: []`) | `@validation`<br>**P2 (Boundary)** | `tests/api/directory.api.spec.ts` |
| **TC-API-32** | **API Dash**| **FR-API-32:** User Session & Dashboard Action Summary | Validates GET `/api/v2/dashboard/employees/action-summary` returns active employee session quick action counts. | HTTP 200 | `@smoke` `@sanity`<br>**P1 (Core)** | `tests/api/modules.api.spec.ts` |
| **TC-API-33** | **API Sec** | **FR-API-33:** Admin User Creation Idempotency & Collision Gate | Submitting identical user payload consecutively rejects second call with HTTP 422 ("Already exists"). | HTTP 422 | `@security` `@validation`<br>**P1 (Idempotency)** | `tests/api/security.api.spec.ts` |
| **TC-API-34** | **API Sec** | **FR-API-34:** High-Concurrency Burst Resilience & Rate Limiting | Sends burst of 15 rapid concurrent requests to verify server handles traffic without 500 errors (HTTP 200/429). | HTTP 200 / 429 | `@security`<br>**P2 (DoS/RateLimit)**| `tests/api/security.api.spec.ts` |
| **TC-API-35** | **API Sec** | **FR-API-35:** Forbidden Assets & Sitemap Access Restriction | Requests `/sitemap.xml`, `/.env`, and system files to ensure server returns 403 Forbidden / 404 Not Found. | HTTP 403 / 404 | `@security`<br>**P2 (Security)** | `tests/api/security.api.spec.ts` |
| **SEC-HDR-01**| **API Sec** | **FR-API-36:** OWASP Security Headers Verification | Validates server returns standard security headers including `Content-Type` and `X-Content-Type-Options: nosniff`. | Header Check | `@security`<br>**P1 (Security)** | `tests/api/security.api.spec.ts` |

---

### 🛡️ 12.3 AJV JSON Schema Contract Suite

| Test ID | Schema Target | Specification & Validation Rule | Priority / Type | Automation File |
| :--- | :--- | :--- | :--- | :--- |
| **SCHEMA-01** | **Dashboard Shortcuts API** | Validates GET `/api/v2/dashboard/shortcuts` against strict JSON Schema (Draft-07) with required `data` object type. | `@sanity` (Positive Contract) | `tests/api/schema.api.spec.ts` |
| **SCHEMA-02** | **System Users List API** | Validates GET `/api/v2/admin/users` against strict JSON Schema enforcing `data: array`, `meta: object`, and `meta.total: number`. | `@sanity` (Positive Contract) | `tests/api/schema.api.spec.ts` |
| **SCHEMA-03** | **Payload Mutation & Drift** | Negative Contract: Mutates payload (converts numeric `total` to string; deletes required `data` key) and asserts AJV compilation strictly flags `valid === false` and captures descriptive error logs. | `@validation` (Negative Contract) | `tests/api/schema.api.spec.ts` |
| **SCHEMA-04** | **API Error Envelope (404/422)** | Negative Contract: Requests non-existent resource `9999999` to trigger HTTP 404; asserts error payload FAILS standard Success Schema while conforming strictly to Error Envelope Schema (`error.status: string`, `error.message: string`). | `@validation` (Negative Contract) | `tests/api/schema.api.spec.ts` |

---

### 📊 12.4 Test Tagging Metrics & Multi-Dimensional Taxonomy

The suite uses a **two-dimensional tagging strategy**: by **Execution Priority** and by **Sidebar Module Origin**:

#### 1. Execution Priority Breakdown:
- **`@p0` (Blocker / Business Critical)**: **12 tests** (Auth gate, employee provisioning, admin data grid, dashboard landing, CSRF protection).
- **`@p1` (Core Transactional & Workflows)**: **32 tests** (CRUD operations, RBAC isolation, personal details update, leave reports, AJV schema contracts).
- **`@p2` (Operational / Site-Wide Navigation Health)**: **24 tests** (All 12 sidebar module routes, continuous navigation walkthrough, boundary pagination, burst 429 rate limiting, dashboard widgets).
- **`@p3` (Social / Auxiliary Widgets)**: **4 tests** (Buzz newsfeed creation, post stream validation).

#### 2. Module Origin Taxonomy (Sidebar Sourced):
- **`@dashboard`**: **8 tests** (Dashboard landing, quick launch shortcuts, time at work, actions, distribution charts, profile menu).
- **`@navigation`**: **13 tests** (All 12 individual sidebar module links + continuous 12-module walkthrough).
- **`@admin`**: **9 tests** (System users table, user provisioning, duplicate collision, role isolation).
- **`@pim`**: **12 tests** (Employee provisioning, auto/custom IDs, personal details mutation, name search).
- **`@directory`**: **7 tests** (Card grid, autocomplete search, job title filter, out-of-range offset boundary).
- **`@auth`**: **8 tests** (UI login, session cookie lifecycle, blank inputs, logout, CSRF token forgery rejection).
- **`@responsive`**: **3 test suites** (Mobile navigation drawer, dashboard viewport overflow, directory grid fluidity).
- **`@security`**: **8 tests** (CSRF gate, maintenance password re-auth, idempotency, DoS burst, OWASP headers).
- **`@leave` / `@time` / `@recruitment` / `@claim` / `@buzz`**: **10 tests** (Microservice API contracts and direct dashboard shortcuts).

---

### 🗺️ 12.5 Master Summary: UI Pages vs. Background REST API Coverage

This matrix summarizes the dual-layer coverage for all primary workflows across the platform, mapping each browser UI entry page to its corresponding background REST API endpoint, HTTP method, and automated test cases:

| Frontend UI Page (Browser Route) | Action / Mutation Trigger | Background REST API Endpoint | HTTP Method | Automated UI Test(s) | Automated API Test(s) | Key Constraints & Assertions Verified |
| :--- | :--- | :--- | :---: | :--- | :--- | :--- |
| `/web/index.php/auth/login` | Click *Login* | `/web/index.php/auth/validate` | `POST` | `[TC-UI-01]`<br>`[TC-UI-02]`<br>`[TC-UI-03]` | `[TC-API-01]`<br>`[TC-API-02]`<br>`[TC-API-03]` | CSRF token lifecycle, HttpOnly cookie extraction, invalid credential rejection (`HTTP 302`). |
| `/web/index.php/pim/addEmployee` | Click *Save* | `/web/index.php/api/v2/pim/employees` | `POST` | `[TC-UI-09]`<br>`[TC-UI-10]`<br>`[TC-UI-11]` | `[TC-API-06]`<br>`[TC-API-07]`<br>`[TC-API-08]`<br>`[TC-API-10]` | Fast seeding (<1.5s), auto/custom ID persistence, duplicate ID DB rejection (`HTTP 422`), missing name validation flags. |
| `/web/index.php/pim/viewPersonalDetails/empNumber/{id}` | Click *Save* (Personal Details) | `/web/index.php/api/v2/pim/employees/{id}/personal-details` | `PUT` | `[TC-UI-09]` (post-creation redirect) | `[TC-API-17]`<br>`[TC-API-18]` | Personal details mutation (name, license, nationality), non-existent employee update rejection (`HTTP 404/422`). |
| `/web/index.php/admin/saveSystemUser` | Click *Save* | `/web/index.php/api/v2/admin/users` | `POST` | `[TC-UI-16]`<br>`[TC-UI-18]` | `[TC-API-12]`<br>`[TC-API-13]`<br>`[TC-API-16]`<br>`[TC-API-33]` | Role assignment, duplicate username collision (`HTTP 422`), idempotency consecutive submission rejection, missing credential validation. |
| `/web/index.php/admin/viewSystemUsers` | Filter by Role / Load | `/web/index.php/api/v2/admin/users?limit=5` | `GET` | `[TC-UI-15]`<br>`[TC-UI-19]` | `[TC-API-11]`<br>`[TC-API-14]`<br>`[SCHEMA-02]`<br>`[SCHEMA-03]` | RBAC data isolation, grid schema contract, pagination envelope (`meta.total`), AJV strict schema & mutation detection. |
| `/web/index.php/recruitment/addCandidate` | Click *Save* | `/web/index.php/api/v2/recruitment/candidates` | `POST` | Monitored in navigation walkthrough | `[TC-API-24]`<br>`[TC-API-25]`<br>`[TC-API-26]` | Candidate provisioning, invalid email regex format rejection (`HTTP 422`), upstream bug handling annotation. |
| `/web/index.php/leave/assignLeave` | View / Assign | `/web/index.php/api/v2/leave/leave-types` & `/leave-requests` | `GET` / `POST` | `[TC-UI-07]` (Quick Launch routing) | `[TC-API-21]`<br>`[TC-API-19]`<br>`[TC-API-20]` | Leave entitlement data, balance report generation, invalid date parameter rejection (`HTTP 400/422`). |
| `/web/index.php/directory/viewDirectory` | Search / Filter | `/web/index.php/api/v2/directory/employees` | `GET` | `[TC-UI-21]`<br>`[TC-UI-22]`<br>`[TC-UI-23]`<br>`[TC-UI-24]`<br>`[TC-UI-25]` | `[TC-API-15]`<br>`[TC-API-31]` | Card profile structure, job title filter contract, out-of-range offset boundary (`offset=999999` returns `[]`). |
| `/web/index.php/dashboard/index` | Page Load / Shortcuts | `/web/index.php/api/v2/dashboard/shortcuts` & `/action-summary` | `GET` | `[TC-UI-06]`<br>`[TC-UI-07]`<br>`[TC-UI-08]`<br>`[TC-UI-36]`<br>`[TC-UI-37]` | `[TC-API-05]`<br>`[TC-API-32]`<br>`[SCHEMA-01]` | Shortcut action payload, employee pending action ledger counts, AJV JSON Schema Draft-07 validation. |
| `/web/index.php/maintenance/*` | Password Gate | `/web/index.php/auth/adminVerify` | `POST` | `[TC-MAINT-01]`<br>`[TC-MAINT-02]`<br>`[TC-MAINT-03]` | `[TC-API-22]`<br>`[TC-API-29]` | Re-authentication gate, unauthorized request rejection (`HTTP 401`), programmatic API pre-authorization helper. |

---

## 13. 💡 Part 3 Assessment Q&A: Beyond the Brief

### ■ What would you do with another three hours?
If granted an additional three hours of engineering investment on this codebase, the priorities would focus on visual regression, automated contract codegen, frontend performance budgets, and chaos network simulation:

1. **Visual Regression & Component Snapshot Testing**:
   - Integrate Playwright screenshot diffing (`await expect(page).toHaveScreenshot({ maxDiffPixelRatio: 0.05 })`) for critical visual UI components:
     - Dashboard Analytics Charts (Employee Distribution by Sub Unit / Location canvases).
     - Time at Work Attendance Punch Clock and Stopwatch widgets.
     - Top navigation profile avatar and dropdown states.
   - Configure dynamic element masking (`mask: [page.locator('.oxd-userdropdown-name')]`) to ignore runtime user variations.

2. **Automated Contract Generation from OpenAPI / Swagger**:
   - Build a CLI synchronization script using `openapi-typescript` and `json-schema-to-typescript`.
   - When OrangeHRM backend teams publish or update their Swagger JSON, the script automatically parses the spec, updates AJV schemas in `schemas/`, and regenerates strict TypeScript interfaces, ensuring 100% type safety and zero manual schema writing.

3. **Core Web Vitals & Frontend Performance Budgets**:
   - Implement automated performance telemetry checks directly within Playwright tests via Chrome DevTools Protocol (`CDPClient`):
     - Assert Largest Contentful Paint (LCP) < 2.5s on `/dashboard/index`.
     - Assert Cumulative Layout Shift (CLS) < 0.1 during employee data table pagination.
     - Assert First Input Delay (FID) < 100ms on navigation clicks.

4. **Network Chaos & Offline Resiliency Simulation**:
   - Implement Playwright request interception (`page.route()`) to simulate real-world degraded network conditions:
     - Simulate `HTTP 503 Service Unavailable` on `/api/v2/pim/employees` to verify that the UI displays a user-friendly error banner rather than a blank white screen.
     - Simulate high-latency 3G throttling (3000ms delay) to test skeleton loader animations and prevent double-submission race conditions.

---

### ■ What did you find that was not in this brief?
During exploratory reverse-engineering, network inspection, and responsive stress testing of the live OrangeHRM OS 5.9 demo environment, several critical architectural discoveries emerged that were not specified in the original brief:

1. **Upstream Unhandled 500 Bug in Recruitment Candidates API**:
   - *Discovery*: When submitting a candidate creation request (`POST /web/index.php/api/v2/recruitment/candidates`) with an empty or missing `email` field, the OrangeHRM backend throws an unhandled `HTTP 500 Internal Server Error` with a PHP stack trace instead of returning a standard client validation `HTTP 422 Unprocessable Entity`.
   - *Framework Response*: Documented in `tests/api/recruitment.api.spec.ts` (`[TC-API-26]`), flagged with Playwright `testInfo.annotations.push({ type: 'fixme', description: 'Upstream OrangeHRM Bug: Empty email returns 500 instead of 422' })`, and given assertion tolerance `[422, 500]` to report the upstream defect without breaking CI gates.

2. **Secondary Administrator Password Re-Authentication Challenge**:
   - *Discovery*: While all standard sidebar links navigate directly, clicking into `/maintenance/*` (Purge Employee Records, Access Personal Data, Candidate Purge) triggers an intermediary security modal (`/web/index.php/auth/adminVerify`) requiring administrator password re-authentication.
   - *Framework Response*: Built dedicated re-auth handling in `MaintenancePage.ts` (`verifyAdministrator()`), added negative unauthorized API tests (`[TC-API-22]`), and created an automated test suite (`tests/e2e/maintenance.spec.ts`).

3. **HTML-Embedded CSRF Token Lifecycle Mechanics**:
   - *Discovery*: OrangeHRM v2 REST APIs do not use stateless JWT bearer tokens; they rely on session cookies coupled with an anti-CSRF token embedded within the login page HTML markup (`:token="&quot;...&quot;"`).
   - *Framework Response*: Engineered a headless authentication helper (`getAuthCookie`) that fetches the login page, parses the CSRF token using regex, and executes a headless POST to `/auth/validate` in under 800ms. This unlocked rapid API test execution without needing to boot a heavy browser for every test.

4. **Vue.js Hydration Race Conditions Prompting `.or()` Resilient Locators**:
   - *Discovery*: The OrangeHRM custom `@oxd` Vue.js component library frequently mounts raw HTML DOM nodes (`<h6>`, `<h5>`, `<div>`) into the document tree milliseconds *before* the browser's accessibility tree assigns computed ARIA roles (`heading`, `menuitem`). Strict `getByRole` locators suffered from intermittent timeout flakiness during rapid route transitions.
   - *Framework Response*: Developed the **Pillar 7 Resilient POM Architecture** using Playwright's `.or()` locator union pattern, pairing primary ARIA roles with semantic HTML tag fallbacks to achieve 100% deterministic test execution.

5. **Responsive DOM Mutation & Topbar Detachment on Mobile**:
   - *Discovery*: When viewport width drops below 768px (iPad portrait and Pixel 7 mobile), OrangeHRM does not simply hide the sidebar—it detaches the desktop topbar from the DOM and mounts an off-canvas slide-out drawer (`.oxd-navbar-nav`) activated by a hamburger button.
   - *Framework Response*: Developed dedicated responsive Page Object methods (`Navbar.ts` and `Sidebar.ts`) that detect viewport boundaries and toggle the hamburger drawer, preventing `ElementNotVisible` failures across tablet and mobile devices.

---

## 14. 📦 Clean Git Push Instructions

The `orangehrm-automation` folder is completely self-contained and ready to be pushed to your GitHub repository:

```bash
cd orangehrm-automation

# Initialize clean Git repository (if not already initialized)
git init -b main

# Link to your GitHub remote
git remote add origin https://github.com/<your-username>/orangehrm-playwright-automation.git

# Verify that .env and .env.test are ignored
git status

# Stage all pure Playwright files
git add .

# Commit and push
git commit -m "feat: complete Playwright TS automation with core container, AJV schema, cross-browser, planner & healer"
git push -u origin main
```
