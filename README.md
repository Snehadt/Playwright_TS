# Playwright Test Automation Framework

## 📋 Table of Contents
- [Overview](#overview)
- [Framework Architecture](#framework-architecture)
- [Installation & Setup](#installation--setup)
- [Project Structure](#project-structure)
- [How the Framework Works](#how-the-framework-works)
- [Running Tests](#running-tests)
- [Cross-Browser Testing](#cross-browser-testing)
- [Parallel Testing](#parallel-testing)
- [Reporting & Logs](#reporting--logs)
- [CI/CD Integration](#cicd-integration)
- [Test Data Generators](#test-data-generators)
- [Best Practices](#best-practices)

---

## 📖 Overview

This is an enterprise-grade **Playwright Test Automation Framework** built with TypeScript, designed for end-to-end testing of the EventHub web application. The framework follows industry best practices and design patterns including:

- **Page Object Model (POM)** - Separation of test logic from page interactions
- **Builder Pattern** - Flexible test data generation
- **Fixture Pattern** - Reusable test components and authenticated sessions
- **Singleton Pattern** - Centralized configuration management
- **Fluent API** - Readable and chainable test methods

### Key Features

✅ **Cross-Browser Testing** - Chromium, Firefox, WebKit support  
✅ **Parallel Execution** - Fast test execution with configurable workers  
✅ **API & UI Authentication** - Fast API-based auth for non-login tests  
✅ **Multiple Reporting** - HTML, Allure, JUnit reports with screenshots  
✅ **CI/CD Ready** - Azure Pipelines integration with Microsoft Playwright Testing  
✅ **Environment Management** - Easy switching between local, staging, production  
✅ **Type Safety** - Full TypeScript support with strict typing  
✅ **Smart Logging** - Winston-based logging with multiple transports  
✅ **Data Builders** - Flexible test data generation with builder pattern  
✅ **AI-Assisted Development** - Enhanced with modern development tools

---

## 🏗️ Framework Architecture

The framework is built on a layered architecture for maintainability and scalability:

```
┌─────────────────────────────────────────────────────────────┐
│                        TEST LAYER                           │
│  (tests/*.spec.ts - Test cases with assertions)            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      FIXTURE LAYER                          │
│  (fixtures/pageFixtures.ts - Reusable test components)     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    PAGE OBJECT LAYER                        │
│  (pages/*.ts - Page interactions and element locators)     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                       BASE PAGE                             │
│  (BasePage.ts - Common methods for all pages)              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   UTILITIES LAYER                           │
│  (utils/ - Data generators, builders, logger, helpers)     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  CONFIGURATION LAYER                        │
│  (ConfigManager - Environment & credentials management)    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    PLAYWRIGHT CORE                          │
│  (Browser automation, assertions, fixtures)                │
└─────────────────────────────────────────────────────────────┘
```

### Architecture Components

#### 1. **Test Layer** (`tests/`)
Contains all test specifications organized by feature:
- `login/` - Authentication tests
- `e2e/` - End-to-end user journey tests
- `addEvents/` - Event creation tests
- `ticketBooking/` - Booking flow tests
- `myBookings/` - User bookings management tests
- `bookingConfirmation/` - Confirmation page tests

#### 2. **Page Object Model** (`pages/`)
Encapsulates page interactions and element locators:
- `BasePage.ts` - Common methods inherited by all pages
- `LoginPage.ts` - Login page interactions
- `EventsPage.ts` - Events listing page
- `EventDetailPage.ts` - Event detail and booking
- `BookEventPage.ts` - Event creation form
- `BookingConfirmationPage.ts` - Confirmation page
- `MyBookingsPage.ts` - User bookings management

#### 3. **Fixtures** (`fixtures/`)
Custom Playwright fixtures for reusable components:
- `pageFixtures.ts` - Page object fixtures
- `testData.ts` - Test data fixtures
- `authenticatedPage` - Pre-authenticated browser context

#### 4. **Utilities** (`utils/`)
Helper functions and classes:
- `dataGenerator.ts` - Random test data generation
- `eventDataGenerator.ts` - Event-specific data
- `builders/BookingBuilder.ts` - Builder pattern for bookings
- `authHelper.ts` - API authentication utilities
- `Logger.ts` - Winston-based logging system
- `AllureHelper.ts` - Allure report integration
- `configHelper.ts` - Configuration access

#### 5. **Configuration** (`config/`)
Centralized configuration management:
- `ConfigManager.ts` - Singleton config manager
- `types.ts` - TypeScript type definitions
- Environment-based URL management
- Credential validation

---

## 🚀 Installation & Setup

### Prerequisites

- **Node.js** v18.x or higher ([Download](https://nodejs.org/))
- **npm** v9.x or higher (comes with Node.js)
- **Git** for version control
- **VS Code** (recommended) with Playwright extension

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd PlaywrightAgent
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install:
- `@playwright/test` - Playwright test runner
- `allure-playwright` - Allure reporting
- `winston` - Logging library
- `dotenv` - Environment variable management

### Step 3: Install Playwright Browsers

```bash
npx playwright install --with-deps
```

This installs Chromium, Firefox, and WebKit browsers with system dependencies.

### Step 4: Configure Environment Variables

Create a `.env` file from the template:

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

```bash
# Environment Selection
TEST_ENV=production  # Options: local, staging, production

# Test Credentials (REQUIRED)
TEST_USER_EMAIL=your.email@example.com
TEST_USER_PASSWORD=YourPassword123

# Base URLs (Optional - auto-selected based on TEST_ENV)
BASE_URL=
API_BASE_URL=

# Test Execution Settings
RUN_PARALLEL=true
BROWSERS=chromium,firefox,webkit
```

⚠️ **Important**: The `.env` file is gitignored and will never be committed to version control.

### Step 5: Verify Installation

Run a smoke test to verify setup:

```bash
npx playwright test tests/login/LoginPage.spec.ts --project=chromium --headed
```

If the browser opens and the test passes, your setup is complete! ✅

### Optional: Install Allure Command Line

For local Allure report viewing:

```bash
npm install -g allure-commandline
```

---

## 📁 Project Structure

```
PlaywrightAgent/
│
├── 📂 config/                          # Configuration management
│   ├── ConfigManager.ts                # Singleton config manager
│   └── types.ts                        # TypeScript type definitions
│
├── 📂 pages/                           # Page Object Models
│   ├── BasePage.ts                     # Base class with common methods
│   ├── LoginPage.ts                    # Login page interactions
│   ├── EventsPage.ts                   # Events listing page
│   ├── EventDetailPage.ts              # Event detail & booking
│   ├── BookEventPage.ts                # Create event form
│   ├── BookingConfirmationPage.ts      # Booking confirmation
│   └── MyBookingsPage.ts               # User bookings management
│
├── 📂 tests/                           # Test specifications
│   ├── 📂 login/                       # Login tests
│   │   └── LoginPage.spec.ts
│   ├── 📂 e2e/                         # End-to-end tests
│   │   └── E2EBookingFlow.spec.ts
│   ├── 📂 addEvents/                   # Event creation tests
│   │   └── EventsPage.spec.ts
│   ├── 📂 ticketBooking/               # Booking flow tests
│   │   └── EventDetailPage.spec.ts
│   ├── 📂 myBookings/                  # Bookings management
│   │   └── MyBookingsPage.spec.ts
│   └── 📂 bookingConfirmation/         # Confirmation tests
│       └── BookingConfirmationPage.spec.ts
│
├── 📂 fixtures/                        # Custom Playwright fixtures
│   ├── pageFixtures.ts                 # Page object fixtures
│   └── testData.ts                     # Test data fixtures
│
├── 📂 utils/                           # Utilities & helpers
│   ├── dataGenerator.ts                # Random data generation
│   ├── eventDataGenerator.ts           # Event-specific data
│   ├── authHelper.ts                   # API authentication
│   ├── configHelper.ts                 # Config access helper
│   ├── Logger.ts                       # Winston logger
│   ├── AllureHelper.ts                 # Allure integration
│   ├── TestContext.ts                  # Test context management
│   └── 📂 builders/                    # Builder pattern implementations
│       └── BookingBuilder.ts           # Booking data builder
│
├── 📂 testData/                        # Static test data (if needed)
│
├── 📄 playwright.config.ts             # Main Playwright configuration
├── 📄 playwright.service.config.ts     # Azure service configuration
├── 📄 azure-pipelines.yml              # CI/CD pipeline definition
├── 📄 .env.example                     # Environment template
├── 📄 .env                             # Local environment (gitignored)
├── 📄 package.json                     # Dependencies & scripts
└── 📄 tsconfig.json                    # TypeScript configuration
```

### Key Directories Explained

#### 📂 `pages/`
Contains Page Object Models (POM) - each file represents a page or component of the application. All page classes extend `BasePage.ts` for common functionality.

#### 📂 `tests/`
Test specifications organized by feature/module. Each test file contains multiple test cases with tags for categorization (@smoke, @critical, @e2e, etc.).

#### 📂 `fixtures/`
Custom Playwright fixtures that extend the base test functionality. Provides reusable page objects and authenticated sessions.

#### 📂 `utils/`
Helper utilities including data generators, authentication helpers, logging, and builder patterns.

#### 📂 `config/`
Centralized configuration management using Singleton pattern. Handles environment switching and credential validation.

---

## ⚙️ How the Framework Works

### 1. **Configuration Initialization**

When tests start, the `ConfigManager` singleton loads environment variables from `.env`:

```typescript
// ConfigManager loads .env file ONCE on first access
const config = ConfigManager.getInstance();
const { email, password } = config.getCredentials();
```

**Benefits:**
- Single source of truth for configuration
- Automatic environment-based URL selection
- Built-in validation for credentials and URLs
- Type-safe configuration access

### 2. **Test Execution Flow**

```
Test Starts → Fixture Setup → Page Object Creation → Test Actions → Assertions → Cleanup
```

**Example Test Flow:**

```typescript
// 1. Import custom fixtures
import { test, expect } from '../../fixtures/pageFixtures';

// 2. Test with auto-injected page objects
test('Book an event', async ({ eventDetailPage }) => {
  // 3. Use page object methods (fluent API)
  await eventDetailPage
    .navigateTo('/events/123')
    .fillBookingForm(bookingData)
    .submitBooking();
  
  // 4. Assertions
  await expect(eventDetailPage.successMessage).toBeVisible();
});
```

### 3. **Page Object Pattern**

Each page class encapsulates:
- Element locators
- Page interactions
- Business logic methods
- Reusable assertions

```typescript
export class EventDetailPage extends BasePage {
  // Locators
  private ticketCountInput = this.page.locator('#ticketCount');
  private bookButton = this.page.locator('button[type="submit"]');
  
  // Methods
  async selectTickets(count: number) {
    await this.fillText(this.ticketCountInput, count.toString());
    return this;
  }
  
  async submitBooking() {
    await this.clickElement(this.bookButton);
    return this;
  }
}
```

**Benefits:**
- Separation of concerns (test logic vs page interactions)
- Reusable page methods across tests
- Easy maintenance when UI changes
- Fluent API with method chaining

### 4. **Fixture-Based Architecture**

Custom fixtures provide reusable components:

```typescript
// fixtures/pageFixtures.ts
export const test = base.extend<PageFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  
  // Pre-authenticated page fixture
  authenticatedPage: async ({ page }, use) => {
    await authenticateViaAPI(page, email, password);
    await use(page);
  }
});
```

**Benefits:**
- Auto-instantiated page objects in tests
- Fast API-based authentication
- Reusable test components
- Automatic setup and teardown

### 5. **Authentication Strategy**

The framework uses two authentication methods:

#### **UI Authentication** (for login tests)
```typescript
test('Login via UI', async ({ loginPage }) => {
  await loginPage.login(email, password);
});
```

#### **API Authentication** (for faster test execution)
```typescript
test('View bookings', async ({ authenticatedPage }) => {
  // Already logged in via API - skip UI login
  await authenticatedPage.goto('/my-bookings');
});
```

**Benefits:**
- 10x faster test execution for non-login tests
- Reduced test flakiness
- Better test isolation

### 6. **Data Generation Strategy**

The framework provides two approaches:

#### **Simple Data Generator**
```typescript
import { generatePhoneNumber, generateEmail } from '../utils/dataGenerator';

const phone = generatePhoneNumber('IN');
const email = generateEmail('test');
```

#### **Builder Pattern** (Recommended)
```typescript
import { BookingBuilder } from '../utils/builders/BookingBuilder';

const booking = new BookingBuilder()
  .withTickets(2)
  .withName('John Doe')
  .withEmail('john@example.com')
  .build();
```

**Builder Benefits:**
- Fluent, readable syntax
- Flexible data composition
- Preset configurations
- Type-safe data structures

### 7. **Test Categorization with Tags**

Tests are tagged for flexible execution:

```typescript
test('Login test @smoke @critical', async ({ loginPage }) => {
  // Test implementation
});
```

**Common Tags:**
- `@smoke` - Critical smoke tests
- `@critical` - High-priority tests
- `@e2e` - End-to-end user journeys
- `@regression` - Full regression suite
- `@security` - Security tests (XSS, SQL injection)
- `@performance` - Performance benchmarks

**Run by tag:**
```bash
npx playwright test --grep @smoke
npx playwright test --grep "@critical.*@e2e"
```

---

## 🎯 Running Tests

### Basic Commands

```bash
# Run all tests (all browsers, parallel)
npx playwright test

# Run all tests in headed mode (see browser)
npx playwright test --headed

# Run specific test file
npx playwright test tests/login/LoginPage.spec.ts

# Run specific test by name
npx playwright test -g "should login successfully"

# Run tests in debug mode
npx playwright test --debug
```

### Run by Tags

```bash
# Run smoke tests only
npx playwright test --grep @smoke

# Run critical tests
npx playwright test --grep @critical

# Run e2e tests
npx playwright test --grep @e2e

# Run multiple tags (AND condition)
npx playwright test --grep "(?=.*@smoke)(?=.*@critical)"

# Exclude tests with specific tag
npx playwright test --grep-invert @skip
```

### Run Specific Browser

```bash
# Run on Chromium only
npx playwright test --project=chromium

# Run on Firefox only
npx playwright test --project=firefox

# Run on WebKit only
npx playwright test --project=webkit

# Run on multiple specific browsers
npx playwright test --project=chromium --project=firefox
```

### Parallel vs Sequential Execution

```bash
# Parallel execution (default - fast)
npx playwright test

# Sequential execution (slower but less resource intensive)
npx playwright test --workers=1

# Custom worker count
npx playwright test --workers=3

# Or via environment variable
RUN_PARALLEL=false npx playwright test
```

### Environment-Specific Execution

```bash
# Run on production (default)
TEST_ENV=production npx playwright test

# Run on staging
TEST_ENV=staging npx playwright test

# Run on local environment
TEST_ENV=local npx playwright test
```

### NPM Scripts

The framework provides convenient npm scripts in `package.json`:

```bash
# Run all tests
npm test

# Run tests with Allure report
npm run test:allure

# Generate Allure report from existing results
npm run allure:generate

# Open Allure report
npm run allure:open

# Serve Allure report
npm run allure:serve

# Run tests and open report (full cycle)
npm run test:report
```

### Advanced Options

```bash
# Run with specific timeout
npx playwright test --timeout=60000

# Run only failed tests from last run
npx playwright test --last-failed

# Update snapshots
npx playwright test --update-snapshots

# Show browser console logs
npx playwright test --headed --trace=on

# Generate trace for debugging
npx playwright test --trace=on

# Maximum failures before stopping
npx playwright test --max-failures=5

# Retry failed tests
npx playwright test --retries=2
```

### View Test Results

```bash
# Open HTML report (after test run)
npx playwright show-report

# Open Allure report
npm run allure:open

# View trace for failed test
npx playwright show-trace trace.zip
```

---

## 🌐 Cross-Browser Testing

The framework supports comprehensive cross-browser testing across **Chromium**, **Firefox**, and **WebKit**.

### Configured Browsers

| Browser | Engine | Status | Use Case |
|---------|--------|--------|----------|
| **Chromium** | Blink | ✅ Active | Chrome, Edge, Opera |
| **Firefox** | Gecko | ✅ Active | Firefox browser |
| **WebKit** | WebKit | ✅ Active | Safari (macOS/iOS) |

### Configuration

Browsers are configured in `playwright.config.ts`:

```typescript
projects: [
  {
    name: 'chromium',
    use: { ...devices['Desktop Chrome'], headless: false },
  },
  {
    name: 'firefox',
    use: { ...devices['Desktop Firefox'], headless: false },
  },
  {
    name: 'webkit',
    use: { ...devices['Desktop Safari'], headless: false },
  },
]
```

### Running Cross-Browser Tests

#### **Default Behavior - All Browsers**
By default, tests run on all three browsers in parallel:

```bash
npx playwright test
```

This executes each test across Chromium, Firefox, and WebKit simultaneously.

#### **Single Browser Execution**

```bash
# Chromium only
npx playwright test --project=chromium

# Firefox only  
npx playwright test --project=firefox

# WebKit only
npx playwright test --project=webkit
```

#### **Multiple Specific Browsers**

```bash
# Chromium and Firefox
npx playwright test --project=chromium --project=firefox

# Firefox and WebKit
npx playwright test --project=firefox --project=webkit
```

#### **Debug Specific Browser**

```bash
# Debug on Firefox
npx playwright test --project=firefox --debug

# Headed mode on WebKit
npx playwright test --project=webkit --headed
```

### Environment Variable Configuration

Control browser execution via `.env` file:

```bash
# All browsers (default)
BROWSERS=chromium,firefox,webkit

# Chromium only
BROWSERS=chromium

# Selected browsers
BROWSERS=chromium,firefox
```

### Browser-Specific Reports

Each browser generates separate results in reports:

- **HTML Report** - Shows pass/fail per browser
- **Allure Report** - Browser distribution graphs
- **Screenshots** - Captured per browser on failure
- **Traces** - Individual trace files per browser

### CI/CD Cross-Browser Testing

Azure Pipelines installs all browsers:

```yaml
- script: npx playwright install --with-deps
  displayName: 'Install Playwright browsers (Chromium, Firefox, WebKit)'
```

Tests run on all browsers with 10 parallel workers:

```yaml
- script: npx playwright test --workers=10
```

### Best Practices

✅ Write browser-agnostic tests  
✅ Use feature detection for browser-specific APIs  
✅ Handle timing differences between browsers  
✅ Use appropriate waits instead of hardcoded delays  
✅ Test visual regressions per browser separately  

**For detailed cross-browser testing guide, see:** [CROSS_BROWSER_TESTING.md](./CROSS_BROWSER_TESTING.md)

---

## ⚡ Parallel Testing

The framework is designed for **maximum parallel execution** to reduce test execution time.

### How Parallel Testing Works

Playwright's parallel execution model:

```
Test Suite (100 tests)
    ↓
┌─────────────┬─────────────┬─────────────┬─────────────┐
│  Worker 1   │  Worker 2   │  Worker 3   │  Worker 4   │
├─────────────┼─────────────┼─────────────┼─────────────┤
│ Chromium    │ Firefox     │ WebKit      │ Chromium    │
│ Test 1      │ Test 1      │ Test 1      │ Test 2      │
│ Test 2      │ Test 2      │ Test 2      │ Test 3      │
│ Test 3      │ Test 3      │ Test 3      │ Test 4      │
└─────────────┴─────────────┴─────────────┴─────────────┘
        ↓           ↓             ↓             ↓
    Results merged and reported
```

Each test runs on **each browser** in parallel workers.

### Configuration

Parallel execution is configured in `playwright.config.ts`:

```typescript
export default defineConfig({
  fullyParallel: process.env.RUN_PARALLEL !== 'false',
  workers: process.env.CI ? 1 : undefined, // Auto in local, sequential in CI
});
```

### Controlling Parallelism

#### **Enable/Disable via Environment**

```bash
# Enable parallel execution (default)
RUN_PARALLEL=true npx playwright test

# Disable parallel execution
RUN_PARALLEL=false npx playwright test
```

Or set in `.env` file:
```bash
RUN_PARALLEL=true
```

#### **Control Worker Count**

```bash
# Use all available CPU cores (default locally)
npx playwright test

# Sequential execution (1 worker)
npx playwright test --workers=1

# Fixed number of workers
npx playwright test --workers=3

# Percentage of CPU cores
npx playwright test --workers=50%
```

#### **CI/CD Worker Configuration**

Azure Pipelines uses 10 workers for maximum parallelism:

```yaml
- script: npx playwright test --workers=10
  displayName: 'Run Playwright Tests on Azure'
```

### Parallel Execution Modes

#### **Fully Parallel** (Default)
All tests in all files run in parallel:

```typescript
fullyParallel: true
```

```bash
# 100 tests × 3 browsers = 300 test instances
# Run time: ~2-3 minutes with 10 workers
```

#### **File-Level Parallel**
Tests within same file run sequentially, files run in parallel:

```typescript
fullyParallel: false
```

```bash
# Tests in file A run sequentially
# Tests in file B run in parallel to file A
```

#### **Sequential Execution**
All tests run one by one:

```bash
npx playwright test --workers=1
```

### Test Isolation

Each parallel test runs in complete isolation:

- ✅ **Separate browser context** - No shared state
- ✅ **Separate storage** - Cookies, localStorage isolated
- ✅ **Separate network** - Independent network calls
- ✅ **Separate authentication** - Each test authenticates independently

### Performance Comparison

| Mode | Workers | Tests | Browsers | Time |
|------|---------|-------|----------|------|
| Sequential | 1 | 50 | 3 | ~30 min |
| Parallel (4) | 4 | 50 | 3 | ~8 min |
| Parallel (10) | 10 | 50 | 3 | ~3 min |
| CI Service | 10 | 50 | 3 | ~2 min |

### Best Practices

✅ **Write isolated tests** - No dependencies between tests  
✅ **Use unique test data** - Avoid data conflicts  
✅ **API authentication** - Faster than UI login  
✅ **Cleanup test data** - If shared resources are used  
✅ **Monitor resource usage** - Don't overload system  

### Debugging Parallel Tests

When debugging, run tests sequentially:

```bash
# Debug mode automatically uses 1 worker
npx playwright test --debug

# Or explicitly
npx playwright test --workers=1 --headed
```

### Sharding for Large Test Suites

Split tests across multiple CI machines:

```bash
# Machine 1 - runs shard 1 of 3
npx playwright test --shard=1/3

# Machine 2 - runs shard 2 of 3
npx playwright test --shard=2/3

# Machine 3 - runs shard 3 of 3
npx playwright test --shard=3/3
```

---

## 📊 Reporting & Logs

The framework provides multiple reporting mechanisms for comprehensive test analysis.

### 1. **HTML Report** (Built-in Playwright)

Generated automatically after test execution.

```bash
# Run tests (report auto-generated)
npx playwright test

# Open HTML report
npx playwright show-report
```

**Features:**
- ✅ Test pass/fail status per browser
- ✅ Screenshots on failure
- ✅ Video recordings (if enabled)
- ✅ Execution timeline
- ✅ Error stack traces
- ✅ Filter by browser, status, file

**Location:** `playwright-report/index.html`

### 2. **Allure Report** (Advanced Reporting)

Rich, interactive reports with detailed test analytics.

#### **Generate Allure Report**

```bash
# Run tests with Allure reporter
npm run test:allure

# Generate report from results
npm run allure:generate

# Open generated report
npm run allure:open

# Or serve report with live reload
npm run allure:serve

# Complete flow (test + generate + open)
npm run test:report
```

#### **Allure Features**

✅ **Overview Dashboard**
- Total tests, pass rate, failure rate
- Test duration trends
- Browser distribution graphs
- Test categorization (smoke, critical, e2e)

✅ **Test Suites**
- Organized by feature/module
- Drill-down to individual tests
- Historical trends

✅ **Categories**
- Auto-categorized failures (smoke, critical)
- Custom categories in `playwright.config.ts`

✅ **Attachments**
- Screenshots
- Videos
- Logs
- Network traces

✅ **Timeline**
- Visual test execution timeline
- Parallel execution view
- Performance bottlenecks

✅ **Environment Info**
- Test environment (local, staging, production)
- Browsers tested (Chromium, Firefox, WebKit)
- Node version
- Test framework version

**Location:** `allure-results/` (raw data), `allure-report/` (HTML)

#### **Allure Configuration**

```typescript
// playwright.config.ts
reporter: [
  ['allure-playwright', {
    detail: true,
    outputFolder: 'allure-results',
    suiteTitle: false,
    categories: [
      {
        name: 'Smoke Tests',
        matchedStatuses: ['failed', 'broken'],
        messageRegex: '.*@smoke.*',
      },
      {
        name: 'Critical Tests',
        matchedStatuses: ['failed', 'broken'],
        messageRegex: '.*@critical.*',
      },
    ],
  }],
]
```

### 3. **JUnit Report** (CI/CD Integration)

XML format for CI/CD systems (Azure DevOps, Jenkins, etc.)

```typescript
// playwright.service.config.ts
reporter: [
  ['junit', { outputFile: 'test-results/junit.xml' }]
]
```

**Used by:** Azure Pipelines for test result visualization

### 4. **Console Output** (List Reporter)

Real-time test execution output in terminal:

```bash
npx playwright test

# Output:
Running 150 tests using 10 workers
  ✓ tests/login/LoginPage.spec.ts:10:5 › should login successfully (chromium)
  ✓ tests/login/LoginPage.spec.ts:10:5 › should login successfully (firefox)
  ✓ tests/login/LoginPage.spec.ts:10:5 › should login successfully (webkit)
  ✗ tests/e2e/E2EBookingFlow.spec.ts:20:5 › should complete booking (chromium)
```

### 5. **Winston Logger** (Custom Logging)

Enterprise-grade logging with multiple transports.

#### **Logger Configuration**

```typescript
// utils/Logger.ts
const logger = winston.createLogger({
  level: 'info',
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});
```

#### **Using Logger in Tests**

```typescript
import { Logger } from '../utils/Logger';

test('Login test', async ({ loginPage }) => {
  Logger.info('Starting login test');
  
  await loginPage.login(email, password);
  Logger.info('Login successful');
  
  // On error
  Logger.error('Login failed', { email, error: err.message });
});
```

#### **Log Levels**

```typescript
Logger.error('Critical error occurred');
Logger.warn('Warning: Deprecated method');
Logger.info('Test step completed');
Logger.debug('Debug information');
Logger.verbose('Verbose output');
```

**Log Files:**
- `logs/error.log` - Error logs only
- `logs/combined.log` - All logs
- Console output - Real-time logs

### 6. **Trace Viewer** (Debugging)

Playwright's trace viewer for detailed debugging:

```bash
# Run with tracing enabled
npx playwright test --trace=on

# View trace for failed test
npx playwright show-trace test-results/<test-name>/trace.zip
```

**Features:**
- ✅ Step-by-step action replay
- ✅ DOM snapshots at each step
- ✅ Network requests/responses
- ✅ Console logs
- ✅ Screenshots at each action

### 7. **Screenshots & Videos**

#### **Screenshots**

Configured to capture on failure:

```typescript
// playwright.config.ts
use: {
  screenshot: 'only-on-failure',
}
```

**Location:** `test-results/<test-name>/test-failed-1.png`

#### **Videos**

Enable video recording:

```typescript
use: {
  video: 'on-first-retry',
}
```

### Report Locations

| Report Type | Location | Purpose |
|-------------|----------|---------|
| **HTML Report** | `playwright-report/` | Quick test overview |
| **Allure Results** | `allure-results/` | Raw Allure data |
| **Allure Report** | `allure-report/` | Rich HTML report |
| **JUnit XML** | `test-results/junit.xml` | CI/CD integration |
| **Logs** | `logs/` | Winston log files |
| **Screenshots** | `test-results/` | Failure screenshots |
| **Traces** | `test-results/` | Debug traces |

### CI/CD Report Publishing

Azure Pipelines publishes artifacts:

```yaml
# Publish Allure results
- task: PublishPipelineArtifact@1
  inputs:
    targetPath: 'allure-results'
    artifact: 'allure-results-$(System.JobAttempt)'

# Publish HTML report
- task: PublishPipelineArtifact@1
  inputs:
    targetPath: 'playwright-report'
    artifact: 'playwright-report-$(System.JobAttempt)'

# Publish test results
- task: PublishTestResults@2
  inputs:
    testResultsFormat: 'JUnit'
    testResultsFiles: '**/test-results/**/*.xml'
```

---

## 🔄 CI/CD Integration

The framework is fully integrated with **Azure Pipelines** using **Microsoft Playwright Testing** service.

### Azure Pipeline Configuration

**File:** `azure-pipelines.yml`

### Pipeline Overview

```yaml
Trigger: main, develop branches
Pool: Azure Pipelines (ubuntu-latest)
Node: v20.x
Browsers: Chromium, Firefox, WebKit
Workers: 10 parallel workers
Service: Microsoft Playwright Testing (Cloud Browsers)
```

### Pipeline Stages

#### **1. Setup Stage**

```yaml
# Install Node.js
- task: NodeTool@0
  inputs:
    versionSpec: '20.x'

# Install dependencies
- script: npm ci

# Install Playwright browsers
- script: npx playwright install --with-deps
```

#### **2. Validation Stage**

Validates required environment variables:

```yaml
- task: Bash@3
  displayName: 'Debug - Verify pipeline variables'
  env:
    TEST_USER_EMAIL: $(TEST_USER_EMAIL)
    TEST_USER_PASSWORD: $(TEST_USER_PASSWORD)
  inputs:
    script: |
      # Check if TEST_USER_EMAIL is set
      if [ -z "$TEST_USER_EMAIL" ]; then
        echo "ERROR: TEST_USER_EMAIL is not set!"
        exit 1
      fi
```

**Benefits:**
- ✅ Early failure if credentials missing
- ✅ Clear error messages with fix instructions
- ✅ Validates email format

#### **3. Environment Setup**

Creates `.env` file with secrets:

```yaml
- task: Bash@3
  displayName: 'Create .env file for tests'
  env:
    TEST_USER_EMAIL: $(TEST_USER_EMAIL)
    TEST_USER_PASSWORD: $(TEST_USER_PASSWORD)
    PLAYWRIGHT_SERVICE_ACCESS_TOKEN: $(PLAYWRIGHT_SERVICE_ACCESS_TOKEN)
  inputs:
    script: |
      printf "TEST_ENV=%s\n" "$TEST_ENV" > .env
      printf "TEST_USER_EMAIL=%s\n" "$TEST_USER_EMAIL" >> .env
      printf "TEST_USER_PASSWORD=%s\n" "$TEST_USER_PASSWORD" >> .env
      printf "BROWSERS=chromium,firefox,webkit\n" >> .env
```

**Secure Variables:**
- `TEST_USER_EMAIL` - Test user email (secret)
- `TEST_USER_PASSWORD` - Test user password (secret)
- `PLAYWRIGHT_SERVICE_ACCESS_TOKEN` - Azure service token (secret)

#### **4. Test Execution**

Runs tests using Microsoft Playwright Testing service:

```yaml
- task: Bash@3
  displayName: 'Run Playwright Tests on Azure'
  inputs:
    script: |
      npx playwright test --config=playwright.service.config.ts --workers=10
```

**Benefits:**
- ✅ Cloud browsers (no local browser management)
- ✅ Scalable (10 parallel workers)
- ✅ Cross-browser testing in cloud
- ✅ Faster execution

#### **5. Report Publishing**

Publishes multiple report types:

```yaml
# Publish test results (JUnit)
- task: PublishTestResults@2
  inputs:
    testResultsFormat: 'JUnit'
    testResultsFiles: '**/test-results/**/*.xml'
    failTaskOnFailedTests: true

# Publish HTML report
- task: PublishPipelineArtifact@1
  inputs:
    targetPath: 'playwright-report'
    artifact: 'playwright-report-$(System.JobAttempt)'

# Publish Allure results
- task: PublishPipelineArtifact@1
  inputs:
    targetPath: 'allure-results'
    artifact: 'allure-results-$(System.JobAttempt)'

# Publish test artifacts (screenshots, traces)
- task: PublishPipelineArtifact@1
  inputs:
    targetPath: 'test-results'
    artifact: 'test-artifacts-$(System.JobAttempt)'
```

### Setting Up CI/CD

#### **Step 1: Azure DevOps Project Setup**

1. Create new project in Azure DevOps
2. Import repository
3. Navigate to **Pipelines** → **New Pipeline**
4. Select **Existing Azure Pipelines YAML file**
5. Choose `azure-pipelines.yml`

#### **Step 2: Configure Pipeline Variables**

Navigate to **Pipelines** → **Edit** → **Variables**

Add the following secret variables:

| Variable Name | Value | Secret |
|--------------|-------|--------|
| `TEST_USER_EMAIL` | your.email@example.com | ✅ |
| `TEST_USER_PASSWORD` | YourPassword123 | ✅ |
| `PLAYWRIGHT_SERVICE_ACCESS_TOKEN` | <azure-service-token> | ✅ |
| `TEST_ENV` | production | ❌ |

**How to add:**
1. Click **Variables** (top right)
2. Click **+ New variable**
3. Enter name and value
4. Check **Keep this value secret** for sensitive data
5. Click **OK** and **Save**

#### **Step 3: Configure Microsoft Playwright Testing**

1. Sign up at [Microsoft Playwright Testing](https://aka.ms/mpt/signup)
2. Create workspace
3. Copy workspace URL and access token
4. Set `PLAYWRIGHT_SERVICE_URL` in pipeline variables
5. Set `PLAYWRIGHT_SERVICE_ACCESS_TOKEN` in pipeline variables

#### **Step 4: Configure Triggers**

Pipeline triggers are set in `azure-pipelines.yml`:

```yaml
trigger:
  branches:
    include:
      - main
      - develop
  paths:
    exclude:
      - README.md
      - docs/**

pr:
  branches:
    include:
      - main
      - develop
```

**Trigger Behavior:**
- ✅ Auto-runs on push to `main` or `develop`
- ✅ Auto-runs on PR to `main` or `develop`
- ❌ Skips on README/docs changes

#### **Step 5: Run Pipeline**

```bash
# Push code to trigger pipeline
git push origin main

# Or manually trigger from Azure DevOps UI
Pipelines → Select Pipeline → Run Pipeline
```

### Viewing CI Results

#### **In Azure DevOps**

1. **Tests Tab** - JUnit test results with pass/fail
2. **Artifacts** - Download HTML reports, Allure results
3. **Logs** - View detailed execution logs
4. **Summary** - Build duration, success rate

#### **Download Reports**

1. Navigate to pipeline run
2. Click **Artifacts** tab
3. Download:
   - `playwright-report-<N>` - HTML report
   - `allure-results-<N>` - Allure data
   - `test-artifacts-<N>` - Screenshots/traces

### Pipeline Performance

| Metric | Value |
|--------|-------|
| **Average Duration** | 3-5 minutes |
| **Workers** | 10 parallel |
| **Browsers** | 3 (Chromium, Firefox, WebKit) |
| **Test Isolation** | Complete |
| **Retry Strategy** | 2 retries on failure |

### Troubleshooting CI/CD

#### **Error: TEST_USER_EMAIL not set**

**Solution:** Add variable in Azure DevOps:
```
Pipelines → Edit → Variables → + New variable
Name: TEST_USER_EMAIL
Value: your.email@example.com
Secret: ✅
```

#### **Error: Playwright service connection failed**

**Solution:** Check service token:
```yaml
PLAYWRIGHT_SERVICE_ACCESS_TOKEN=$(PLAYWRIGHT_SERVICE_ACCESS_TOKEN)
```

#### **Tests failing only in CI**

**Common causes:**
- Environment differences
- Timing issues (use proper waits)
- Missing environment variables
- Browser version differences

**Debug steps:**
1. Download test artifacts from pipeline
2. Review screenshots/traces
3. Check pipeline logs
4. Run locally with same config

---

## 🎲 Test Data Generators

The framework provides flexible test data generation using two approaches:

### 1. Simple Data Generators

**Location:** `utils/dataGenerator.ts`

Quick, function-based data generation:

```typescript
import {
  generatePhoneNumber,
  generateEmail,
  generateFullName,
  generateRandomNumber,
  generateRandomString
} from '../utils/dataGenerator';
```

#### **Available Generators**

##### **Phone Numbers**

```typescript
// Indian phone number: +91 XXXXXXXXXX
const indianPhone = generatePhoneNumber('IN');
// Example: "+91 9876543210"

// US phone number: +1 (XXX) XXX-XXXX
const usPhone = generatePhoneNumber('US');
// Example: "+1 (555) 123-4567"

// Default (Indian)
const phone = generatePhoneNumber();
```

##### **Email Addresses**

```typescript
// With custom prefix
const email = generateEmail('testuser');
// Example: "testuser_1234567890_5432@example.com"

// Default prefix 'test'
const email = generateEmail();
// Example: "test_1234567890_9876@example.com"
```

##### **Full Names**

```typescript
const name = generateFullName();
// Examples: "Rahul Sharma", "Sarah Johnson", "Priya Patel"
```

##### **Random Numbers**

```typescript
// Random number between 1 and 10 (inclusive)
const tickets = generateRandomNumber(1, 10);

// Random number between 100 and 999
const id = generateRandomNumber(100, 999);
```

##### **Random Strings**

```typescript
// Alphanumeric string (length 10)
const username = generateRandomString(10);
// Example: "aB3xY9mK2p"

// Alphabetic only (length 8)
const code = generateRandomString(8, false);
// Example: "xKmPqRsT"
```

##### **Booking Details** (Deprecated)

```typescript
// ⚠️ Deprecated - Use BookingBuilder instead
const booking = generateBookingDetails(2);
```

### 2. Builder Pattern (Recommended)

**Location:** `utils/builders/BookingBuilder.ts`

Flexible, chainable data construction:

```typescript
import { BookingBuilder } from '../utils/builders/BookingBuilder';
```

#### **Basic Usage**

```typescript
// Build complete booking data
const booking = new BookingBuilder()
  .withTickets(2)
  .withName('John Doe')
  .withEmail('john@example.com')
  .withPhone('+91 9876543210')
  .build();

// Result:
{
  numberOfTickets: 2,
  fullName: 'John Doe',
  email: 'john@example.com',
  phoneNumber: '+91 9876543210'
}
```

#### **Random Data Generation**

```typescript
// Generate all fields randomly
const booking = new BookingBuilder()
  .withRandomData()
  .build();

// Or specify some fields, randomize others
const booking = new BookingBuilder()
  .withTickets(3)
  .withRandomData()  // Randomizes name, email, phone
  .build();
```

#### **Preset Configurations**

```typescript
// Single ticket booking
const singleBooking = new BookingBuilder()
  .single()
  .build();

// Couple tickets (2)
const coupleBooking = new BookingBuilder()
  .couple()
  .build();

// Family tickets (4)
const familyBooking = new BookingBuilder()
  .family()
  .build();

// Group tickets (10)
const groupBooking = new BookingBuilder()
  .group()
  .build();

// Maximum tickets (20)
const maxBooking = new BookingBuilder()
  .max()
  .build();
```

#### **Phone Number Configuration**

```typescript
// Indian phone number (default)
const booking = new BookingBuilder()
  .withIndianPhone()
  .build();

// US phone number
const booking = new BookingBuilder()
  .withUSPhone()
  .build();
```

#### **Method Chaining**

```typescript
// Fluent API - chain multiple methods
const booking = new BookingBuilder()
  .couple()                          // 2 tickets
  .withName('Sarah Smith')           // Custom name
  .withUSPhone()                     // US phone format
  .build();
```

#### **Complex Example**

```typescript
// Test edge case: Maximum tickets with specific data
const maxBooking = new BookingBuilder()
  .max()                             // 20 tickets
  .withName('Test User')             // Specific name
  .withEmail('test@example.com')     // Specific email
  .withIndianPhone()                 // Indian format
  .build();

// Test validation: Zero tickets
const invalidBooking = new BookingBuilder()
  .withTickets(0)
  .withRandomData()
  .build();
```

### 3. Event Data Generator

**Location:** `utils/eventDataGenerator.ts`

Generate event-specific test data:

```typescript
import {
  generateEventTitle,
  generateEventDescription,
  generateEventLocation,
  generateEventCapacity
} from '../utils/eventDataGenerator';

// Event title
const title = generateEventTitle();
// Example: "Tech Conference 2024"

// Event description
const description = generateEventDescription();
// Example: "Join us for an amazing tech conference..."

// Event location
const location = generateEventLocation();
// Example: "Mumbai, India"

// Event capacity (50-500)
const capacity = generateEventCapacity();
// Example: 250
```

### Usage in Tests

#### **Example 1: Simple Generator**

```typescript
import { test, expect } from '../../fixtures/pageFixtures';
import { generateEmail, generatePhoneNumber } from '../../utils/dataGenerator';

test('Book event with random data', async ({ eventDetailPage }) => {
  const email = generateEmail('booking');
  const phone = generatePhoneNumber('IN');
  
  await eventDetailPage
    .fillEmail(email)
    .fillPhone(phone)
    .submitBooking();
});
```

#### **Example 2: Builder Pattern**

```typescript
import { test, expect } from '../../fixtures/pageFixtures';
import { BookingBuilder } from '../../utils/builders/BookingBuilder';

test('Book couple tickets', async ({ eventDetailPage }) => {
  const booking = new BookingBuilder()
    .couple()
    .withRandomData()
    .build();
  
  await eventDetailPage.fillBookingForm(booking);
  await eventDetailPage.submitBooking();
  
  await expect(eventDetailPage.confirmationMessage)
    .toContain(booking.fullName);
});
```

#### **Example 3: Multiple Bookings**

```typescript
test('Create multiple bookings', async ({ eventDetailPage }) => {
  const bookings = [
    new BookingBuilder().single().withRandomData().build(),
    new BookingBuilder().couple().withRandomData().build(),
    new BookingBuilder().family().withRandomData().build(),
  ];
  
  for (const booking of bookings) {
    await eventDetailPage.fillBookingForm(booking);
    await eventDetailPage.submitBooking();
    
    // Verify each booking
    await expect(eventDetailPage.confirmationMessage).toBeVisible();
  }
});
```

#### **Example 4: Edge Cases**

```typescript
test('Test booking boundaries @boundary', async ({ eventDetailPage }) => {
  const testCases = [
    new BookingBuilder().withTickets(1).build(),    // Minimum
    new BookingBuilder().withTickets(20).build(),   // Maximum
    new BookingBuilder().withTickets(10).build(),   // Mid-range
  ];
  
  for (const booking of testCases) {
    await eventDetailPage.fillBookingForm(booking);
    // Test assertions
  }
});
```

### Data Generator Best Practices

#### **✅ DO:**

- Use **Builder pattern** for complex data structures
- Use **simple generators** for single values
- Generate **unique emails** for each test (timestamp-based)
- Randomize data to avoid test dependencies
- Use **presets** (single, couple, family) for readability

#### **❌ DON'T:**

- Hardcode test data in tests
- Reuse same email across tests (conflicts)
- Generate data inside assertions
- Use production data in tests
- Share data between parallel tests

### Custom Data Generators

Create your own generators for specific needs:

```typescript
// utils/customDataGenerator.ts
export function generateCreditCard(): string {
  // Generate test credit card number
  return '4111111111111111'; // Test card
}

export function generateCouponCode(): string {
  return `COUPON_${Date.now()}`;
}

// Use in tests
import { generateCouponCode } from '../utils/customDataGenerator';

const coupon = generateCouponCode();
```

### Data Files

**Location:** `testData/`

For static test data (if needed):

```typescript
// testData/users.json
{
  "adminUser": {
    "email": "admin@example.com",
    "role": "admin"
  },
  "testUser": {
    "email": "test@example.com",
    "role": "user"
  }
}

// Import in tests
import users from '../testData/users.json';

test('Admin login', async ({ loginPage }) => {
  await loginPage.login(users.adminUser.email, password);
});
```

### Summary

| Approach | Use Case | Complexity | Flexibility |
|----------|----------|------------|-------------|
| **Simple Generators** | Single values | Low | Low |
| **Builder Pattern** | Complex objects | Medium | High |
| **Event Generators** | Event-specific data | Low | Medium |
| **Static Data** | Known test users | Low | Low |

**Recommendation:** Use **Builder Pattern** for most test data needs.

---

## 💡 Best Practices

### Test Writing

#### **1. Use Page Object Model**

✅ **DO:**
```typescript
// Use page objects
test('Login', async ({ loginPage }) => {
  await loginPage.login(email, password);
});
```

❌ **DON'T:**
```typescript
// Direct page interactions in test
test('Login', async ({ page }) => {
  await page.fill('#email', email);
  await page.fill('#password', password);
  await page.click('button');
});
```

#### **2. Use Fixtures for Page Objects**

✅ **DO:**
```typescript
import { test, expect } from '../../fixtures/pageFixtures';

test('Test', async ({ loginPage, eventsPage }) => {
  // Auto-instantiated page objects
});
```

❌ **DON'T:**
```typescript
import { test, expect } from '@playwright/test';

test('Test', async ({ page }) => {
  const loginPage = new LoginPage(page); // Manual instantiation
});
```

#### **3. Use API Authentication for Speed**

✅ **DO:**
```typescript
// Use authenticatedPage fixture
test('View bookings', async ({ authenticatedPage }) => {
  await authenticatedPage.goto('/bookings');
});
```

❌ **DON'T:**
```typescript
// UI login in every test
test('View bookings', async ({ loginPage, page }) => {
  await loginPage.login(email, password);
  await page.goto('/bookings');
});
```

#### **4. Use Descriptive Test Names with Tags**

✅ **DO:**
```typescript
test('should display validation error for empty email @smoke @validation', async () => {
  // Clear purpose and categorized
});
```

❌ **DON'T:**
```typescript
test('test1', async () => {
  // Unclear purpose
});
```

#### **5. Use Proper Waits**

✅ **DO:**
```typescript
await page.waitForSelector('button:visible');
await page.waitForLoadState('networkidle');
```

❌ **DON'T:**
```typescript
await page.waitForTimeout(5000); // Hardcoded delay
```

#### **6. Use Test Data Builders**

✅ **DO:**
```typescript
const booking = new BookingBuilder()
  .couple()
  .withRandomData()
  .build();
```

❌ **DON'T:**
```typescript
const booking = {
  tickets: 2,
  name: 'Test User', // Hardcoded
  email: 'test@test.com' // Not unique
};
```

### Project Structure

#### **7. Keep Tests Isolated**

✅ Each test should run independently  
✅ No dependencies between tests  
✅ Generate unique test data  
✅ Clean up after tests if needed  

#### **8. Organize Tests by Feature**

```
tests/
├── login/          # Authentication tests
├── e2e/            # End-to-end flows
├── booking/        # Booking functionality
└── events/         # Event management
```

#### **9. Use Meaningful File Names**

✅ `LoginPage.spec.ts` - Clear  
❌ `test1.spec.ts` - Unclear  

### Configuration

#### **10. Environment-Based Configuration**

✅ Use `.env` for environment-specific values  
✅ Use `ConfigManager` for centralized config  
✅ Never hardcode URLs or credentials  
✅ Keep `.env` out of version control  

#### **11. Secret Management**

✅ Store credentials in `.env` (gitignored)  
✅ Use Azure Pipeline secret variables in CI  
✅ Never commit `.env` file  
✅ Use `.env.example` as template  

### Performance

#### **12. Parallel Execution**

✅ Enable `fullyParallel: true`  
✅ Use appropriate worker count  
✅ Ensure test isolation  

#### **13. API Authentication**

✅ Use API auth for non-login tests (10x faster)  
✅ Reserve UI login for authentication tests only  

### Maintenance

#### **14. DRY Principle**

✅ Reuse page methods  
✅ Create utility functions  
✅ Use fixtures for common setup  

#### **15. Code Reviews**

✅ Review page object changes  
✅ Check test coverage  
✅ Verify naming conventions  
✅ Ensure no hardcoded values  

---

## 🎓 Learning Resources

### For Beginners

1. **Playwright Basics**
   - [Playwright Getting Started](https://playwright.dev/docs/intro)
   - [Locators Guide](https://playwright.dev/docs/locators)
   - [Assertions](https://playwright.dev/docs/test-assertions)

2. **TypeScript**
   - [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
   - [TypeScript for JavaScript Programmers](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html)

3. **Page Object Model**
   - [POM Pattern](https://playwright.dev/docs/pom)
   - Framework's `pages/BasePage.ts` - Reference implementation

### For Advanced Users

1. **Design Patterns**
   - Builder Pattern - `utils/builders/BookingBuilder.ts`
   - Singleton Pattern - `config/ConfigManager.ts`
   - Fixture Pattern - `fixtures/pageFixtures.ts`

2. **CI/CD**
   - [Azure Pipelines](https://docs.microsoft.com/en-us/azure/devops/pipelines/)
   - [Microsoft Playwright Testing](https://aka.ms/mpt/docs)

3. **Claude AI**
   - [Claude Code Documentation](https://claude.ai/code)


## 👥 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Follow existing code structure and patterns
4. Write tests for new features
5. Update documentation
6. Commit changes (`git commit -m 'Add AmazingFeature'`)
7. Push to branch (`git push origin feature/AmazingFeature`)
8. Open Pull Request


**Last Updated:** May 2026  
**Framework Version:** 1.0.0  
**Playwright Version:** 1.60.0

