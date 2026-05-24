# 🔄 Environment Switching Guide

This guide explains how to switch between different test environments (Local, Staging, Production).

---

## 📋 Quick Reference

| Environment | TEST_ENV | BASE_URL Example | When to Use |
|-------------|----------|------------------|-------------|
| **Local** | `local` | `http://localhost:3000` | Local development |
| **Staging** | `staging` | `https://staging.eventhub.rahulshettyacademy.com` | Pre-production testing |
| **Production** | `production` | `https://eventhub.rahulshettyacademy.com` | Production validation |

---

## 🎯 Method 1: Edit `.env` File (Recommended)

### Step 1: Open `.env` file in the root directory

```bash
# Current configuration (Production)
TEST_ENV=production
BASE_URL=https://eventhub.rahulshettyacademy.com
API_BASE_URL=https://api.eventhub.rahulshettyacademy.com
```

### Step 2: Change URLs for different environments

#### For LOCAL Environment:
```env
TEST_ENV=local
BASE_URL=http://localhost:3000
API_BASE_URL=http://localhost:8080
TEST_USER_EMAIL=sneharestassured@gmail.com
TEST_USER_PASSWORD=Testing1@
```

#### For STAGING Environment:
```env
TEST_ENV=staging
BASE_URL=https://staging.eventhub.rahulshettyacademy.com
API_BASE_URL=https://staging.api.eventhub.rahulshettyacademy.com
TEST_USER_EMAIL=staging.user@example.com
TEST_USER_PASSWORD=StagingPass123
```

#### For PRODUCTION Environment:
```env
TEST_ENV=production
BASE_URL=https://eventhub.rahulshettyacademy.com
API_BASE_URL=https://api.eventhub.rahulshettyacademy.com
TEST_USER_EMAIL=sneharestassured@gmail.com
TEST_USER_PASSWORD=Testing1@
```

### Step 3: Save and run tests
```bash
npx playwright test
```

---

## 🚀 Method 2: Command Line Override (One-time run)

Override environment without editing `.env` file:

### Test on LOCAL:
```bash
BASE_URL=http://localhost:3000 API_BASE_URL=http://localhost:8080 TEST_ENV=local npx playwright test
```

### Test on STAGING:
```bash
BASE_URL=https://staging.eventhub.rahulshettyacademy.com TEST_ENV=staging npx playwright test
```

### Test on PRODUCTION:
```bash
BASE_URL=https://eventhub.rahulshettyacademy.com TEST_ENV=production npx playwright test
```

---

## 🔧 Method 3: Multiple .env Files (CI/CD)

Create separate environment files:

```bash
.env.local       # Local development config
.env.staging     # Staging environment config
.env.production  # Production environment config
```

### Using NPM Scripts (Add to package.json):

```json
{
  "scripts": {
    "test:local": "cp .env.local .env && npx playwright test",
    "test:staging": "cp .env.staging .env && npx playwright test",
    "test:production": "cp .env.production .env && npx playwright test"
  }
}
```

Then run:
```bash
npm run test:staging
```

---

## 🔍 Verify Current Environment

Run the environment check test:

```bash
npx playwright test environmentCheck.spec.ts
```

This will display:
- ✅ Current BASE_URL and API_BASE_URL
- ✅ TEST_ENV value
- ✅ Environment detection (isLocal, isStaging, isProduction)
- ✅ Built URLs for testing

---

## 💡 How It Works Behind the Scenes

```
.env file
   ↓
ConfigManager.loadEnvironment() 
   ↓
ConfigManager.buildConfig()
   ↓
config.getUiBaseUrl() / config.getApiBaseUrl()
   ↓
Used in tests: config.getUiUrl('/login')
```

---

## 🛡️ Environment-Specific Test Logic

Use environment detection in your tests:

```typescript
import { ENV } from '../config/urls';

test('admin operations', async ({ page }) => {
    // Skip destructive tests on production
    if (ENV.isProduction()) {
        test.skip();
    }
    
    // Run admin operations
});

test('use mock data', async ({ page }) => {
    const useMocks = ENV.isLocal();
    
    if (useMocks) {
        // Setup mock data
    } else {
        // Use real API
    }
});
```

---

## 📝 Best Practices

1. **Never commit `.env` file** - It contains credentials
2. **Always update `.env.example`** - So team knows what variables exist
3. **Use TEST_ENV consistently** - Match it with BASE_URL
4. **Verify before running** - Run `environmentCheck.spec.ts` first
5. **Use command-line override for quick tests** - Don't edit .env for one-off runs

---

## ⚠️ Common Issues

### Issue: Tests still use old URL after changing .env
**Solution**: Restart your terminal or IDE to reload environment variables

### Issue: Environment detection shows wrong environment
**Solution**: Check if BASE_URL matches expected pattern (localhost, staging, rahulshettyacademy.com)

### Issue: .env changes not reflected
**Solution**: Ensure no spaces around `=` in .env file
```bash
# ❌ Wrong
BASE_URL = http://localhost:3000

# ✅ Correct
BASE_URL=http://localhost:3000
```

---

## 🎯 Quick Commands

```bash
# Check current environment
npx playwright test environmentCheck.spec.ts

# Run tests on staging (one-time)
BASE_URL=https://staging.example.com TEST_ENV=staging npx playwright test

# Run specific test on production
npx playwright test myBookings/MyBookingsPage.spec.ts

# Run with headed browser to see which URL is being used
npx playwright test --headed
```

---

## 📞 Need Help?

If URLs are not being loaded correctly:
1. Check `.env` file exists in project root
2. Verify no syntax errors in `.env`
3. Run `environmentCheck.spec.ts` to debug
4. Check `ConfigManager.ts` line 65-72 for .env loading logic
