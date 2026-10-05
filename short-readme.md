# OrangeHRM QA Automation Framework — Executive Submission Readme

> **Target Platform:** OrangeHRM OS 5.9 Open Source (`https://opensource-demo.orangehrmlive.com`)  
> **Tech Stack:** Playwright TypeScript `v1.62.1` · Node.js `v22` · AJV JSON Schema Validator · GitHub Actions CI

---

## ⚡ 1. Setup & Quick Start Guide

### 📋 Prerequisites & Versions
* **Node.js**: `v20.x` or `v22.x`
* **Playwright**: `v1.62.1`
* **Container Image (CI)**: `ghcr.io/rodlesterldizon-collab/core-test-suite/test-runner:v1.62.1`

### 💻 1-Minute Local Setup
```bash
# 1. Clone repository and install dependencies
git clone <repo-url> && cd orangehrm-automation
npm ci

# 2. Install Playwright browser binaries
npx playwright install --with-deps

# 3. Initialize local environment config (zero secrets needed for public demo)
cp .env.example .env
```

### 🚀 Execution Commands
```bash
# Run Entire Test Suite (E2E Regression + REST API + AJV Schema)
npm test

# Run Specific Sub-Suites
npm run test:api          # Headless REST API & Schema Contracts (<15s)
npm run test:desktop      # Desktop Chrome E2E Suite (Admin, PIM, Maintenance, Nav)
npm run test:tablet       # Tablet Responsive Suite (iPad 768x1024)
npm run test:mobile       # Mobile Responsive Suite (Pixel 7 393x851)
npm run test:schema       # AJV JSON Schema Contract Tests only

# Interactive & Debugging Modes
npm run test:ui           # Interactive UI Mode (Visual Time-Travel & DOM Timeline)
npm run test:headed       # Headed Mode (Visible browser window)
npm run report            # View local HTML Test Report
```

---

## 🔬 2. Exploratory Testing & Quality Findings

### ■ Areas and Features Explored
* **Authentication & CSRF**: Login form validation, password masking, CSRF token extraction, and HttpOnly session cookies.
* **Admin Module & RBAC**: User provisioning, `Admin`/`ESS` role binding, duplicate username rejection, and dynamic role search filtering.
* **PIM (Employee Management)**: Custom vs auto-generated employee IDs, personal details mutation, and profile image containers.
* **Maintenance & Security Gateway**: Secondary administrator password re-authentication challenge, employee record purges, and personal data downloads.
* **Directory Search**: Autocomplete employee lookup and multi-attribute job title filtering.
* **Dashboard Widgets**: Quick launch shortcuts, "Time at Work" punch clock, and "My Actions" approval ledgers.
* **12-Module Site-Wide Navigation**: Route transitions and HTTP status codes across all sidebar links.
* **Responsive Viewports**: Desktop Chromium (1280x720), iPad Tablet (768x1024), and Google Pixel 7 Mobile (393x851).
* **REST API Contract & Schema**: 36 backend endpoints validated against strict AJV JSON Schema Draft-07 contracts.

### ■ Important Observations
* **Client Logo External Redirection**: Clicking the top-left client logo redirects the browser to an external sales site (`https://www.orangehrm.com/`), breaking active session context.
* **Vue.js Class-Heavy DOM**: Heavy use of custom `.oxd-*` classes with minimal semantic IDs/`data-testid` attributes, requiring accessibility-first locators with `.or()` fallback selectors.
* **Asynchronous Table Card Re-Rendering**: Virtual DOM updates during search require state synchronization before evaluating row counts.

### ■ Bugs Discovered
* **[BUG-01] Buzz Module Sidebar Link Disappearance & 403 API Error**: The Buzz module link intermittently vanishes from the public demo, and direct requests return `403 Forbidden`. Handled in test `[TC-NAV-12]` using an HTTP endpoint probe and `testInfo.fixme()`.
* **[BUG-02] Recruitment Candidate API Unhandled 500 (`[TC-API-26]`)**: Sending `POST /api/v2/recruitment/candidates` with an empty email throws an unhandled `HTTP 500 Internal Server Error` (with PHP stack trace) instead of client validation `HTTP 422`. Handled with `@fixme` annotation and tolerance assertion `[422, 500]`.
* **[BUG-03] External Brand Logo Link Missing `target="_blank"`**: Navigates away from the app within the same tab.

### ■ Risks & Areas Needing Further Testing
* **Admin Credentials Printed on Login Page**: Default administrator credentials are displayed in a helper card on the login screen.
* **Self-Service Password Reset Exposure (`/pim/updatePassword`)**: Changing the shared password on the demo instance risks global lockout for subsequent test runs.
* **Hourly Public Demo Database Wipes**: Static database IDs become invalid after periodic wipes, requiring dynamically generated timestamped fixtures.

---

## 📋 3. Five High-Value Test Cases

1. **`[TC-UI-16]` / `[TC-UI-18]` Admin User Provisioning & Duplicate Rejection (P0 — Critical)**
   * *Rationale*: Access Governance and RBAC integrity. Validates admin creation, role binding, and prevents collision/privilege escalation.
2. **`[TC-PIM-01]` Employee Onboarding & Custom ID Persistence (P0 — Critical)**
   * *Rationale*: Foundational HRIS entity. All downstream modules (payroll, leave, timesheets) depend on reliable employee record integrity.
3. **`[TC-MAINT-01 / TC-MAINT-02]` Secondary Admin Password Re-Auth Gateway (P0 — Security Boundary)**
   * *Rationale*: Protects destructive capabilities (GDPR personal data download and employee record purges) behind an administrative password wall.
4. **`[TC-API-01 / TC-SCHEMA-01]` REST API Session & AJV Schema Governance (P1 — Core Architecture)**
   * *Rationale*: Catches backend breaking schema drift and data serialization errors in <15s before reaching the frontend.
5. **`[TC-NAV-13 / TC-RESP-01]` Responsive Viewport Drawer & Real-Time Filter (P2 — Multi-Device Usability)**
   * *Rationale*: Ensures operational usability for desktop, tablet, and mobile workforces, validating hamburger drawer toggles and instant search filtering.

---

## 🏛️ 4. Engineering Decisions & Architectural Reasoning

### ■ How did you structure the project, and why?
* **Modular Page Object Model (`pom/`)**: Encapsulates pages (`AdminPage.ts`, `PimPage.ts`, `MaintenancePage.ts`, `DirectoryPage.ts`) and reusable components (`Sidebar.ts`, `Navbar.ts`).
* **Custom Playwright Fixtures (`fixtures/page-objects.fixture.ts`)**: Automatically injects initialized page objects into tests, eliminating boilerplate.
* **Separation of E2E vs. API (`tests/e2e/` vs `tests/api/`)**: Keeps heavy UI tests decoupled from ultra-fast headless API contract tests.
* **AJV Schema Engine (`tests/api/schemas/`)**: Provides automated JSON Schema validation on API payloads.
* **Autonomous Tools (`tools/`)**: Includes test planner generator and locator resilience healer.

### ■ What was your locator strategy, and why did you choose it?
* **Accessibility-First Locators (`getByRole`, `getByPlaceholder`, `getByText`, `getByLabel`)**: Follows Playwright best practices to mirror real user interactions.
* **Resilient `.or()` Fallback Unions**: Bypasses Vue.js rendering delays where raw HTML elements mount before ARIA roles are computed.
* **Container Scoping**: Restricts table queries strictly to `.oxd-table-body` to avoid false matches against header rows.

### ■ How did you handle authentication across tests, and why that approach?
* **Global Setup with Persistent Storage State (`auth.setup.ts` → `.auth/admin.json`)**: Logs in once before the suite runs and saves browser state to disk. All UI tests reuse this session, cutting test execution time by ~80%.
* **Headless Programmatic CSRF/Session Helper (`getAuthCookie`)**: For API tests, parses the CSRF token from login HTML and calls `/auth/validate` directly, completing authentication in under 800ms with zero browser overhead.

### ■ What did you deliberately not automate, and why?
* **Destructive Password Changes (`/pim/updatePassword`)**: Prevent locking out parallel test workers on shared demo environments.
* **External Email Inbox Verification**: Mail servers are disabled on the public demo instance.
* **Commercial Upgrade Links & External Ads**: Links point to third-party marketing domains outside the application scope.

---

## ⏱️ 5. Additional Evaluation Questions

### ■ What would you do with another three hours?
1. **Visual Regression Testing**: Add pixel-diff visual snapshot tests (`await expect(page).toHaveScreenshot()`) across core pages (Dashboard, Admin, Employee List) on all 3 viewports.
2. **Lighthouse & Core Web Vitals CI Audits**: Integrate CDP client checks to assert Largest Contentful Paint (LCP) < 2.5s and Cumulative Layout Shift (CLS) < 0.1.
3. **Backend Test Data Factories**: Build an isolated REST API seeding utility to create and destroy isolated employee records per worker, enabling high-concurrency parallel runs (`workers: 8`).

### ■ What did you find that was not in this brief?
* **Hidden CSRF Token Extraction**: Discovered that OrangeHRM requires parsing an anti-CSRF token embedded inside the login HTML component props (`:token="&quot;...&quot;"`) to authenticate API requests.
* **Secondary Password Re-Auth Gateway**: Identified that all `/maintenance/*` views require entering administrator credentials through a re-verification modal.
* **Buzz Module Flakiness on Public Demo**: Found that the Buzz module is intermittently disabled by upstream maintainers, requiring an automated pre-test endpoint probe (`testInfo.fixme()`).
