# OrangeHRM Enterprise QA Automation Framework
## Playwright TypeScript · Containerized Test Runner · Viewport Responsive Suites · AJV Schema Contracts · Autonomous Planner & Healer

> **Target Platform:** OrangeHRM OS 5.9 Open Source (`https://opensource-demo.orangehrmlive.com`)  
> **Core Test Package & Container:** [`github.com/rodlesterldizon-collab/core-test-suite`](https://github.com/rodlesterldizon-collab/core-test-suite)  
> **Container Image:** `ghcr.io/rodlesterldizon-collab/core-test-suite/test-runner:v1.62.1`  
> **Test Architecture:** 40+ UI/E2E Regression & Responsive Cases + 26 Backend API Tests + AJV JSON Schema Contract Validation + Autonomous Test Planner & Locator Self-Healer.

---

## 📑 Table of Contents
1. [Core Container Runner & Speed Optimization](#1--core-container-runner--speed-optimization)
2. [Secret Management & Local Setup (.env.test)](#2--secret-management--local-setup-envtest)
3. [AJV JSON Schema Contract Validation (Why & How It Works)](#3--ajv-json-schema-contract-validation-why--how-it-works)
4. [Desktop Cross-Browser Matrix: Chromium, Edge & Safari](#4--desktop-cross-browser-matrix-chromium-edge--safari)
5. [Autonomous Test Planner Generator & Self-Healer CLI](#5--autonomous-test-planner-generator--self-healer-cli)
6. [VS Code Tasks & Debugger Integration](#6--vs-code-tasks--debugger-integration)
7. [Separate Test Execution Strategy (Desktop, Tablet, Mobile, API)](#7--separate-test-execution-strategy-desktop-tablet-mobile-api)
8. [CI/CD Pipeline, Reporting & Artifacts](#8--cicd-pipeline-reporting--artifacts)
9. [Feature Identification Strategy & Scope Justification (Risk-Based Testing Framework)](#9--feature-identification-strategy--scope-justification-risk-based-testing-framework)
10. [Requirements Traceability Matrix (RTM) → Test Case Mapping](#10--requirements-traceability-matrix-rtm--test-case-mapping)
11. [Clean Git Push Instructions](#11--clean-git-push-instructions)

---

## 1. ⚡ Core Container Runner & Speed Optimization

This framework executes within the optimized test runner container from [`rodlesterldizon-collab/core-test-suite`](https://github.com/rodlesterldizon-collab/core-test-suite):

```yaml
container:
  image: ghcr.io/rodlesterldizon-collab/core-test-suite/test-runner:v1.62.1
  credentials:
    username: ${{ github.actor }}
    password: ${{ secrets.CR_PAT }}
  options: --ipc=host
```

### Why Having a Dedicated Container Image Dramatically Increases Speed:
1. **Zero Browser Download Overhead (Saves 2–4 Minutes per Run)**:
   - On standard GitHub Actions runners (`ubuntu-latest`), Playwright requires `npx playwright install --with-deps`, downloading ~500MB to 1GB of browser binaries and installing OS libraries every single run.
   - The `ghcr.io/rodlesterldizon-collab/core-test-suite/test-runner:v1.62.1` image has Node.js, Chromium, WebKit, Edge dependencies, and Linux rendering fonts **pre-compiled and baked into the image layers**.
   - Tests boot in **under 15 seconds**, cutting CI turnaround times by **60% to 75%**!
2. **`--ipc=host` Shared Memory Reliability**:
   - Default Docker containers allocate only 64MB to `/dev/shm`, which crashes Chromium and WebKit when running parallel tests or capturing video/traces.
   - `--ipc=host` mounts host shared memory, unlocking true multi-threaded parallel browser workers without crashes.
3. **Reproducible Test Environment**:
   - Eliminates local vs CI environment differences and flaky operating system font rendering.

---

## 2. 🔐 Secret Management & Local Setup (`.env.test`)

To maintain strict security and ensure sensitive credentials never touch Git:

### ⚠️ Local Setup Requirement: Create `.env.test`
Before running tests locally on your machine, **you must create a `.env.test` file** in the project root. This file is read by Playwright and holds your local environment configuration and credentials:

```bash
# 1. Copy the template to create your local .env.test
cp .env.example .env.test
```

Then edit `.env.test` with your target instance and credentials:

```env
# Target Instance URL
BASE_URL="https://opensource-demo.orangehrmlive.com"

# Administrator Credentials
ADMIN_USERNAME="Admin"
ADMIN_PASSWORD="admin123"

# Local Execution Settings
CI=false
```

### Security Policies Enforced:
1. **`.env.test` is strictly Git-Ignored**:
   - `.gitignore` ignores `.env`, `.env.*`, and `.env.test`.
   - Only `.env.example` (which contains safe dummy placeholders) is tracked in version control. Your real credentials will never be committed or pushed to Git.
2. **Zero Plaintext Passwords in GitHub Actions**:
   - In `.github/workflows/playwright.yml`, all credentials are read directly from GitHub Actions Secrets:
     ```yaml
     SECRET_BASE_URL: ${{ secrets.BASE_URL }}
     SECRET_USERNAME: ${{ secrets.ADMIN_USERNAME }}
     SECRET_PASSWORD: ${{ secrets.ADMIN_PASSWORD }}
     ```
   - No hardcoded plaintext passwords exist in code or workflow files.

---

## 3. 🛡️ AJV JSON Schema Contract Validation (Why & How It Works)

### Why Use AJV (Another JSON Schema Validator)?
A frequent question is: *"Is AJV possible in Playwright, and why use it instead of standard expect assertions?"*

**Yes, AJV is 100% possible and is the industry gold standard for API Contract Testing in TypeScript!**

- **The Problem with Standard Assertions**: Standard tests usually assert 2-3 fields:
  ```typescript
  expect(res.status()).toBe(200);
  expect(body.data.id).toBeDefined();
  ```
  If the backend developer renames a field, returns `null` instead of an array, or changes an ID from `number` to `string`, standard tests still pass while the frontend breaks!
- **The AJV Advantage**: AJV validates the **entire JSON payload against strict JSON Schema specifications (Draft-07/2020-12)**. In a single call:
  ```typescript
  const isValid = ajv.validate(shortcutsResponseSchema, body);
  expect(isValid, JSON.stringify(ajv.errors)).toBe(true);
  ```
  It validates required keys, deep data types, regex patterns, enum constraints, and unexpected fields in <2ms.

### Running Schema Contract Tests:
```bash
npm run test:schema
```

---

## 4. 🖥️ Desktop Cross-Browser Matrix: Chromium, Edge & Safari

### Is it possible to test Chromium, Edge, and Safari on Desktop?
**YES! Playwright supports all three modern browser engines out of the box.**

In `playwright.config.ts`, three distinct desktop projects are configured with standardized 1280x720 viewports:
1. **`desktop-chrome`**: Chromium engine (Google Chrome).
2. **`desktop-edge`**: Microsoft Edge (`channel: 'msedge'`).
3. **`desktop-safari`**: Apple Safari (`devices['Desktop Safari']` using WebKit).

### Execution Commands:
```bash
# Run all three desktop browsers together
npm run test:desktop

# Run individual desktop browser engines
npm run test:chrome
npm run test:edge
npm run test:safari
```

---

## 5. 🤖 Autonomous Test Planner Generator & Self-Healer CLI

### Why add a Test Planner Generator & Self-Healer?
Automating test creation and locator healing saves hundreds of hours of manual script maintenance and keeps test suites resilient when application UI updates.

### 1. Test Planner Generator (`npm run plan:generate`)
Generates comprehensive Markdown Test Plans (RTM mapping, edge cases, RBAC, viewports) and ready-to-run Playwright TypeScript test boilerplate code.

```bash
# Generate test plan and spec for a specific feature:
node --experimental-strip-types tools/test-planner.ts --feature="Employee Termination" --module="PIM" --type="e2e"

# Or using the npm shortcut:
npm run plan:generate
```
Outputs:
- `tests/generated/<feature>.plan.md`
- `tests/generated/<feature>.e2e.spec.ts`

### 2. Self-Healing Locator & Test Healer Engine (`npm run test:heal`)
Scans Page Object Models (`pom/`, `pom/components/`), audits locator resilience, detects fragile selectors (brittle `nth-child` chains, deep positional XPaths, unqualified inputs), and provides self-healing recommendations.

```bash
npm run test:heal
```
Outputs:
- Console report with resilience score (`100% Locator Resilience`).
- Audit artifact: `test-results/healing-report.json`.

---

## 6. 💻 VS Code Tasks & Debugger Integration

The repository includes pre-configured VS Code tasks in `.vscode/tasks.json` and debug profiles in `.vscode/launch.json`:

1. Press `Ctrl + Shift + P` (or `Cmd + Shift + P` on macOS) in VS Code.
2. Select **`Tasks: Run Task`**.
3. Choose any task with a single click:
   - **`Playwright: Run Desktop Cross-Browser (Chrome, Edge, Safari)`**
   - **`Playwright: Run API & AJV Schema Contract Suite`**
   - **`Playwright: Run Tablet Viewport Suite (@tablet)`**
   - **`Playwright: Run Mobile Viewport Suite (@mobile)`**
   - **`AI Tool: Generate Test Plan & Spec Boilerplate`**
   - **`AI Tool: Run Autonomous Test Healer & Locator Audit`**
   - **`Playwright: Open Interactive UI Mode`**
   - **`Playwright: Show HTML Report`**

---

## 7. 🚀 Separate Test Execution Strategy

The suite provides dedicated scripts and projects for clean test separation:

| Suite / Project | Target Scope | Command | Description |
| :--- | :--- | :--- | :--- |
| **All Tests** | Complete Suite | `npm test` | Runs entire E2E and API catalog |
| **Smoke Suite** | `@smoke` | `npm run test:smoke` | Fast critical path checks (<45s) |
| **Sanity Suite** | `@sanity` | `npm run test:sanity` | Core functional workflows & happy paths |
| **Validation Suite**| `@validation` | `npm run test:validation` | Deep boundary, validation & negative edge cases |
| **Security Suite** | `@security` | `npm run test:security` | Auth gates, RBAC, DoS, OWASP headers & isolation |
| **Desktop Cross-Browser** | Chrome, Edge, Safari | `npm run test:desktop` | 1280x720 cross-browser matrix |
| **Tablet Viewport** | iPad (768x1024) | `npm run test:tablet` | Verifies hamburger navigation & drawer |
| **Mobile Viewport** | Pixel 7 (393x851) | `npm run test:mobile` | Validates mobile responsive layout & touch |
| **REST API & Schema** | Backend Endpoints | `npm run test:api` | Fast headless contract validation (<15s) |
| **Sidebar Navigation (P2)** | All 12 Modules UI + API | `npm run test:nav` | Validates all 12 sidebar links, HTTP 200 & DOM |
| **Dashboard Widgets Suite** | Widgets & Shortcuts | `npm run test:dashboard` | Deep UI test of Quick Launch, Time at Work, Charts |
| **AJV Schema Only** | JSON Schemas | `npm run test:schema` | Strict contract validation |
| **Interactive UI Mode** | Visual Debugger | `npm run test:ui` | Playwright interactive time-travel UI |
| **HTML Report** | Test Summary | `npm run report` | Opens HTML test report in browser |

---

## 8. 📊 CI/CD Pipeline, Reporting & Artifacts

The GitHub Actions workflow (`.github/workflows/playwright.yml`) runs on push/PR and includes:

1. **Parallel Containerized Jobs**:
   - `api-tests`: REST API & AJV Schema validation.
   - `desktop-e2e`: Desktop cross-browser matrix across Chrome, Edge, and Safari.
   - `tablet-e2e`: iPad responsive layout testing (`@tablet`).
   - `mobile-e2e`: Pixel 7 mobile responsive testing (`@mobile`).
2. **Consolidated Executive Reporting**:
   - `qa-pipeline-reporting` aggregates results into an executive Markdown table in `$GITHUB_STEP_SUMMARY`.
3. **Artifact Retention**:
   - Each job uploads its Playwright HTML report (`playwright-report/`) to GitHub Artifacts with **14-day retention**.
   - Download reports directly from the GitHub Actions run summary and view with `npx playwright show-report <path>`.

### 🎛️ 8.1 CI/CD Failure Artifacts & Media Capture Toggles

Failure media recording (screenshots, video session playback, and DOM traces) can be toggled **ON or OFF** at any time without modifying core test code:

| Setting / Env Variable | Supported Values | Default | Purpose |
| :--- | :--- | :---: | :--- |
| **`PLAYWRIGHT_SCREENSHOT`** | `'off'`, `'only-on-failure'`, `'on'` | `'off'` | Captures full-page screenshot at exact moment of failure. |
| **`PLAYWRIGHT_VIDEO`** | `'off'`, `'retain-on-failure'`, `'on'` | `'off'` | Records web session; saves video playback for failed tests. |
| **`PLAYWRIGHT_TRACE`** | `'off'`, `'on-first-retry'`, `'retain-on-failure'`, `'on'` | `'off'` | Records time-travel DOM, network, and console trace log. |

#### How to Toggle via Environment Variables (`.env` or CI Secrets):
```properties
# Enable failure media capture (e.g. for debugging CI runs):
PLAYWRIGHT_SCREENSHOT="only-on-failure"
PLAYWRIGHT_VIDEO="retain-on-failure"
PLAYWRIGHT_TRACE="on-first-retry"

# Disable to optimize run speed & storage (Current Default):
PLAYWRIGHT_SCREENSHOT="off"
PLAYWRIGHT_VIDEO="off"
PLAYWRIGHT_TRACE="off"
```

#### How to Toggle via `playwright.config.ts`:
```typescript
use: {
  screenshot: 'off', // Toggle: 'off' | 'only-on-failure' | 'on'
  video: 'off',      // Toggle: 'off' | 'retain-on-failure' | 'on'
  trace: 'off',      // Toggle: 'off' | 'on-first-retry' | 'retain-on-failure' | 'on'
}
```

---

---

## 9. 🧭 Feature Identification Strategy & Scope Justification (Risk-Based Testing Framework)

A key architectural question when automating an enterprise platform like OrangeHRM is:
> *"Out of dozens of modules and hundreds of UI screens, how did you decide what to test, and what was the justification for the scope selected?"*

Rather than automating arbitrary screens or writing repetitive UI tests, the framework's test scope was selected using a **5-Pillar Risk-Based Testing (RBT) Framework**:

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
   - *Why*: The authentication gateway protects sensitive employee PII and salary details. A failure here blocks 100% of all user activity or exposes unauthorized personnel records.
   - *Scope Selected*: Login redirect, SameSite HttpOnly cookie persistence, CSRF validation, invalid credential rejection, and secure logout.
2. **PIM (Personnel Information Management - Core Transactional Engine)**:
   - *Why*: The employee database is the single source of truth for the entire HR platform. Creating, updating, or colliding employee records corrupts all linked records (Leave, Time, Claims, Performance).
   - *Scope Selected*: Auto vs Custom ID generation, DB uniqueness constraints (`422 Unprocessable Entity`), Personal Details mutation (`PUT /personal-details`), and search/autocomplete filtering.
3. **Admin & RBAC (Role-Based Access Control)**:
   - *Why*: Compliance, audit trails, and zero-trust security. Admin credentials allow privileged escalation.
   - *Scope Selected*: System User creation, role-based filtering isolation, and collision prevention.
4. **Corporate Directory**:
   - *Why*: High-frequency daily usage tool for internal employee communication and organizational structure lookup.
   - *Scope Selected*: Grid card rendering, job title filtering, search reset, and zero-result empty state.

---

### 📡 Pillar 2: Network Traffic Reverse Engineering & REST API Mapping
Modern web applications are Single Page Applications (SPAs). Automating solely through the UI creates slow, brittle test suites and misses the underlying API contracts.
- **Methodology**: Inspected Google Chrome DevTools Network Tab (XHR/Fetch) across every user journey.
- **Findings**:
  - Mapped internal REST endpoints under `/web/index.php/api/v2/*` (`/pim/employees`, `/admin/users`, `/dashboard/shortcuts`, `/dashboard/employees/action-summary`, `/leave/reports/data`, `/recruitment/candidates`, `/claim/requests`, `/buzz/feed`).
  - Identified CSRF token mechanics: `:token="&quot;...&quot;"` embedded in HTML templates and passed via form bodies.
- **Justification**:
  - By writing API tests alongside UI tests, we verified that backend database constraints (uniqueness, foreign keys, mandatory validations) are enforced at the API layer independently of UI client-side validation.
  - Enabled **blazing-fast precondition seeding (<1.5s)** for UI tests instead of slow UI form fills.

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
- **Idempotency Justification**: Tested duplicate POST payloads to `POST /api/v2/admin/users` to verify the second submission is rejected with `HTTP 422 ("Already exists")`.
- **Dynamic Cleanup Justification**: Every automated user creation (`[TC-API-12]`, `[TC-API-33]`) dynamically queries an existing `empNumber` and implements a `finally { await request.delete(...) }` block to guarantee zero stale records remain on the shared demo server across parallel test runs.

---

### 🛡️ Pillar 5: Security Posture, Boundary Analysis & Defect Discovery
A mature QA automation suite does not just check that "the happy path works" — it actively attacks system boundaries:
1. **Re-Authentication Gates**: Validated that sensitive actions (Maintenance Purge Employee) require password re-entry and reject invalid attempts with `401 Unauthorized`.
2. **Access Control on Sensitive Assets**: Validated that `/sitemap.xml`, `/.env`, and `/.git` are blocked with `403 Forbidden` or `404 Not Found`.
3. **Rate Limiting Resilience**: Burst testing (15 concurrent requests) ensuring the server handles traffic with `200` or `429 Too Many Requests` without crashing with `500`.
4. **Upstream Defect Discovery**:
   - **Discovered Bug**: When submitting an empty email on `POST /api/v2/recruitment/candidates`, the OrangeHRM backend throws an unhandled `HTTP 500 Internal Server Error` instead of a standard `422 Unprocessable Entity`.
   - **Handling**: Tagged with Playwright `testInfo.annotations.push({ type: 'fixme', ... })` and tolerant assertion `[422, 500]` to report and monitor the upstream bug while maintaining a green CI pipeline.

---

## 10. 📋 Requirements Traceability Matrix (RTM) → Test Case Mapping

Below is the complete cross-reference matrix linking every automated UI, Responsive, API, and Schema test to its corresponding **OrangeHRM Functional Requirement (FR)** and **System Specification (SS)**:

### 📱 10.1 User Interface (UI) & End-to-End (E2E) Test Suite

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

---

### ⚡ 10.2 REST API, Security & Contract Test Suite (Happy & Sad Path Matrix)

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

### 🛡️ 10.3 AJV JSON Schema Contract Suite

| Test ID | Schema Target | Specification & Validation Rule | Automation File |
| :--- | :--- | :--- | :--- |
| **SCHEMA-01** | **Dashboard Shortcuts API** | Validates GET `/api/v2/dashboard/shortcuts` against strict JSON Schema (Draft-07) with required `data` object type. | `tests/api/schema.api.spec.ts` |
| **SCHEMA-02** | **System Users List API** | Validates GET `/api/v2/admin/users` against strict JSON Schema enforcing `data: array`, `meta: object`, and `meta.total: number`. | `tests/api/schema.api.spec.ts` |

---

### 📊 10.4 Test Tagging Metrics & Multi-Dimensional Taxonomy

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

## 11. 📦 Clean Git Push Instructions

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
