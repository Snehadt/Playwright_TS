# 🔄 URL Setting - Complete Step-by-Step Flow

## STEP 1️⃣: `.env` File (Source of Truth)

**Location:** `.env` (root directory)

```env
BASE_URL=https://eventhub.rahulshettyacademy.com
API_BASE_URL=https://api.eventhub.rahulshettyacademy.com
TEST_ENV=production
```

This is where YOU set the environment URL.

---

## STEP 2️⃣: ConfigManager Loads .env File

**File:** `config/ConfigManager.ts`  
**Lines:** 65-72

```typescript
private loadEnvironment(): void {
    const envPath = path.resolve(__dirname, '../.env');
    const result = dotenv.config({ path: envPath });
    
    if (result.error) {
        console.warn(`⚠️ Warning: Could not load .env file`);
    }
}
```

**What happens:**
- Finds `.env` file in project root
- Loads all variables into `process.env.BASE_URL`, `process.env.API_BASE_URL`, etc.

---

## STEP 3️⃣: ConfigManager Stores URLs in Config Object

**File:** `config/ConfigManager.ts`  
**Lines:** 78-98

```typescript
private buildConfig(): TestConfig {
    return {
        credentials: {
            email: process.env.TEST_USER_EMAIL || '',
            password: process.env.TEST_USER_PASSWORD || ''
        },
        api: {
            baseUrl: process.env.API_BASE_URL || 'https://api.eventhub.rahulshettyacademy.com',
            // ☝️ LINE 85: API URL stored here
        },
        ui: {
            baseUrl: process.env.BASE_URL || 'https://eventhub.rahulshettyacademy.com',
            // ☝️ LINE 90: UI URL stored here
        },
        environment: {
            name: process.env.TEST_ENV || 'local',
            // ☝️ LINE 95: Environment name stored
        }
    };
}
```

**What happens:**
- Reads `process.env.BASE_URL` → stores in `this.config.ui.baseUrl`
- Reads `process.env.API_BASE_URL` → stores in `this.config.api.baseUrl`
- Reads `process.env.TEST_ENV` → stores in `this.config.environment.name`

---

## STEP 4️⃣: ConfigManager Constructor Executes (Once)

**File:** `config/ConfigManager.ts`  
**Lines:** 34-41

```typescript
private constructor() {
    this.loadEnvironment();      // ← STEP 2 happens here
    this.config = this.buildConfig();  // ← STEP 3 happens here
    this.validateConfig();       // ← Validates URLs are correct
    this.isInitialized = true;
    console.log('✓ ConfigManager initialized');
}
```

**When this runs:** First time someone calls `ConfigManager.getInstance()`

---

## STEP 5️⃣: Public Getter Methods Expose URLs

**File:** `config/ConfigManager.ts`  
**Lines:** 215-228

### Method 1: Get Base URL Only
```typescript
public getUiBaseUrl(): string {
    return this.config.ui.baseUrl;
}
// Returns: "https://eventhub.rahulshettyacademy.com"
```

### Method 2: Build Full URL with Path
```typescript
public getUiUrl(path: string): string {
    const baseUrl = this.config.ui.baseUrl.replace(/\/$/, '');
    // baseUrl = "https://eventhub.rahulshettyacademy.com"
    
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    // cleanPath = "/login"
    
    return `${baseUrl}${cleanPath}`;
    // Returns: "https://eventhub.rahulshettyacademy.com/login"
}
```

---

## STEP 6️⃣: Tests Get ConfigManager Instance

**Example:** `tests/myBookings/MyBookingsPage.spec.ts`  
**Line:** 13

```typescript
import { ConfigManager } from '../../config/ConfigManager';

test.describe('My Bookings Page', () => {
    let config: ConfigManager;
    
    test.beforeEach(async ({ page }) => {
        config = ConfigManager.getInstance();
        // ☝️ Gets singleton instance (or creates it if first time)
    });
```

**What happens:**
- `getInstance()` checks if instance exists
- If NO → creates new instance → triggers constructor → loads .env
- If YES → returns existing instance (fast, no reload)

---

## STEP 7️⃣: Tests Use config.getUiUrl() to Build URLs

**Example:** `tests/myBookings/MyBookingsPage.spec.ts`  
**Line:** 124

```typescript
test('Navigate to bookings page', async ({ page }) => {
    await page.goto(config.getUiUrl('/bookings'));
});
```

**Execution flow:**
```
config.getUiUrl('/bookings')
    ↓
ConfigManager.getUiUrl() [Line 224]
    ↓
baseUrl = this.config.ui.baseUrl
baseUrl = "https://eventhub.rahulshettyacademy.com"
    ↓
cleanPath = "/bookings"
    ↓
return baseUrl + cleanPath
    ↓
"https://eventhub.rahulshettyacademy.com/bookings"
    ↓
page.goto("https://eventhub.rahulshettyacademy.com/bookings")
```

---

## 🎯 COMPLETE FLOW DIAGRAM

```
┌────────────────────────────────────────────────────┐
│  STEP 1: .env File                                 │
│  BASE_URL=https://eventhub.rahulshettyacademy.com  │
└──────────────────┬─────────────────────────────────┘
                   │
                   ↓ dotenv.config() reads file
┌────────────────────────────────────────────────────┐
│  STEP 2: Environment Variables Loaded             │
│  process.env.BASE_URL = "https://..."             │
└──────────────────┬─────────────────────────────────┘
                   │
                   ↓ buildConfig() line 90
┌────────────────────────────────────────────────────┐
│  STEP 3: Stored in Config Object                  │
│  this.config.ui.baseUrl = process.env.BASE_URL     │
└──────────────────┬─────────────────────────────────┘
                   │
                   ↓ Singleton pattern
┌────────────────────────────────────────────────────┐
│  STEP 4: ConfigManager Instance Created            │
│  ConfigManager.instance (cached for reuse)         │
└──────────────────┬─────────────────────────────────┘
                   │
                   ↓ Tests call getInstance()
┌────────────────────────────────────────────────────┐
│  STEP 5: Test Gets Config                         │
│  const config = ConfigManager.getInstance()        │
└──────────────────┬─────────────────────────────────┘
                   │
                   ↓ Test calls getUiUrl('/bookings')
┌────────────────────────────────────────────────────┐
│  STEP 6: URL Built                                 │
│  getUiUrl() concatenates:                          │
│  this.config.ui.baseUrl + '/bookings'              │
│  = "https://eventhub.rahulshettyacademy.com/bookings" │
└──────────────────┬─────────────────────────────────┘
                   │
                   ↓ Passed to Playwright
┌────────────────────────────────────────────────────┐
│  STEP 7: Browser Navigates                        │
│  await page.goto("https://...com/bookings")       │
└────────────────────────────────────────────────────┘
```

---

## 🔍 REAL EXAMPLE WITH ACTUAL VALUES

### Starting Point: .env File
```env
BASE_URL=https://eventhub.rahulshettyacademy.com
TEST_ENV=production
```

### Execution Trace:

1. **Test starts:** `npx playwright test myBookings/MyBookingsPage.spec.ts`

2. **Test imports ConfigManager:** Line 13
   ```typescript
   import { ConfigManager } from '../../config/ConfigManager';
   ```

3. **Test calls getInstance():** Line 19
   ```typescript
   config = ConfigManager.getInstance();
   ```

4. **First time? Constructor runs:**
   ```
   loadEnvironment() → reads .env file
   buildConfig() → stores BASE_URL in this.config.ui.baseUrl
   Result: this.config.ui.baseUrl = "https://eventhub.rahulshettyacademy.com"
   ```

5. **Test builds URL:** Line 124
   ```typescript
   config.getUiUrl('/bookings')
   ```

6. **getUiUrl() executes:** Line 224-228
   ```typescript
   baseUrl = this.config.ui.baseUrl
          = "https://eventhub.rahulshettyacademy.com"
   
   cleanPath = "/bookings"
   
   return baseUrl + cleanPath
   return "https://eventhub.rahulshettyacademy.com/bookings"
   ```

7. **Playwright navigates:**
   ```typescript
   await page.goto("https://eventhub.rahulshettyacademy.com/bookings")
   ```

---

## 📝 WHERE TO CHANGE THE URL

| Want to Change | Edit This | Line | Result |
|----------------|-----------|------|---------|
| Environment | `.env` → `BASE_URL=...` | Line 5 | All tests use new URL |
| Add new path | Test code → `config.getUiUrl('/new-path')` | N/A | Uses BASE_URL + new path |
| Change default | `ConfigManager.ts` → Line 90 fallback | Line 90 | Only if .env missing |

---

## ✅ KEY POINTS

1. **URLs come from `.env` file** - Edit there to change environment
2. **ConfigManager loads once** - Singleton pattern, cached for performance  
3. **getUiUrl() builds full URLs** - Combines BASE_URL + your path
4. **Every test uses same BASE_URL** - Consistent across all tests
5. **Change .env = all tests update** - No code changes needed
