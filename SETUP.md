# Project Setup Guide

## Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

## Initial Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy the example environment file and update with your credentials:
```bash
cp .env.example .env
```

Edit `.env` and replace with your actual test credentials:
```bash
TEST_USER_EMAIL=your.email@example.com
TEST_USER_PASSWORD=YourPassword123
```

⚠️ **IMPORTANT**: Never commit the `.env` file - it's gitignored for security.

### 3. Verify Setup
Run a sample test to ensure everything is configured:
```bash
npx playwright test tests/login/LoginPage.spec.ts --headed
```

## Running Tests

### Run all tests
```bash
npx playwright test
```

### Run specific test file
```bash
npx playwright test tests/e2e/E2EBookingFlow.spec.ts
```

### Run tests by tag
```bash
npx playwright test --grep @smoke
npx playwright test --grep @critical
npx playwright test --grep @e2e
```

### Run tests in headed mode (see browser)
```bash
npx playwright test --headed
```

### Run tests sequentially (not parallel)
```bash
RUN_PARALLEL=false npx playwright test
```

## Configuration

### Environment Variables (.env file)
```bash
# Base URLs
BASE_URL=https://eventhub.rahulshettyacademy.com
API_BASE_URL=https://api.eventhub.rahulshettyacademy.com

# Test Credentials (REQUIRED)
TEST_USER_EMAIL=your.email@example.com
TEST_USER_PASSWORD=YourPassword123

# Test Execution
RUN_PARALLEL=true
```

### Playwright Config
Main configuration is in `playwright.config.ts`:
- **retries**: 1 (retry failed tests once)
- **screenshot**: only-on-failure
- **baseURL**: Set from `.env` or defaults to production
- **fullyParallel**: Controlled by `RUN_PARALLEL` env var

## Project Structure
```
PlaywrightAgent/
├── pages/               # Page Object Models
│   ├── LoginPage.ts
│   ├── EventsPage.ts
│   ├── BookEventPage.ts
│   └── ...
├── tests/              # Test files
│   ├── login/
│   ├── e2e/
│   ├── bookEvent/
│   └── ...
├── utils/              # Helper utilities
│   ├── authHelper.ts
│   ├── dataGenerator.ts
│   └── configHelper.ts
├── config/             # Configuration
│   └── urls.ts
├── testData/           # Test data (deprecated for credentials)
├── .env                # Environment variables (gitignored)
├── .env.example        # Template for .env
└── playwright.config.ts
```

## Troubleshooting

### Error: "Test credentials not found in environment variables"
- Ensure `.env` file exists in project root
- Verify `TEST_USER_EMAIL` and `TEST_USER_PASSWORD` are set in `.env`
- Run `cat .env` to check file contents

### Tests failing with 401 Unauthorized
- Check credentials in `.env` are correct
- Try logging in manually at the application URL
- Verify API base URL is correct

### Browsers not launching
```bash
npx playwright install
```

## CI/CD Setup

For CI/CD environments, set environment variables as secrets:
```yaml
env:
  TEST_USER_EMAIL: ${{ secrets.TEST_USER_EMAIL }}
  TEST_USER_PASSWORD: ${{ secrets.TEST_USER_PASSWORD }}
  BASE_URL: ${{ vars.BASE_URL }}
```

## Need Help?
- See `docs/CREDENTIALS_MIGRATION.md` for credential setup details
- Check `playwright.config.ts` for test configuration options
- Review test files in `tests/` for examples
