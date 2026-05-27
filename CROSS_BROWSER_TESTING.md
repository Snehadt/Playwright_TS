# Cross-Browser Testing Guide

This framework supports **cross-browser testing** across Chromium, Firefox, and WebKit browsers.

## Configured Browsers

The following browsers are configured in `playwright.config.ts`:

| Browser | Device Profile | Status |
|---------|---------------|--------|
| **Chromium** | Desktop Chrome | ✅ Active |
| **Firefox** | Desktop Firefox | ✅ Active |
| **WebKit** | Desktop Safari | ✅ Active |

## Running Tests Across All Browsers

### Default Behavior
By default, tests run on **all three browsers** in parallel:

```bash
npx playwright test
```

This will execute your test suite on:
- Chromium
- Firefox  
- WebKit

## Running Tests on Specific Browsers

### Single Browser
Run tests on a specific browser using the `--project` flag:

```bash
# Run on Chromium only
npx playwright test --project=chromium

# Run on Firefox only
npx playwright test --project=firefox

# Run on WebKit only
npx playwright test --project=webkit
```

### Multiple Specific Browsers
Run tests on selected browsers:

```bash
# Run on Chromium and Firefox
npx playwright test --project=chromium --project=firefox

# Run on Firefox and WebKit
npx playwright test --project=firefox --project=webkit
```

## Configuration via Environment Variables

You can configure which browsers to use via the `BROWSERS` environment variable in your `.env` file:

```bash
# All browsers (default)
BROWSERS=chromium,firefox,webkit

# Chromium only
BROWSERS=chromium

# Chromium and Firefox
BROWSERS=chromium,firefox
```

**Note:** The `BROWSERS` env variable is tracked by ConfigManager but the actual browser execution is controlled by the `--project` flag or `playwright.config.ts` projects configuration.

## CI/CD Configuration

### Azure Pipelines
The Azure pipeline (`azure-pipelines.yml`) is configured to:

1. **Install all browsers** during the setup phase:
   ```yaml
   - script: npx playwright install --with-deps
     displayName: 'Install Playwright browsers (Chromium, Firefox, WebKit)'
   ```

2. **Run tests on all browsers** via Microsoft Playwright Testing service:
   ```yaml
   - script: npx playwright test --config=playwright.service.config.ts --workers=10
   ```

3. **Generate separate reports** for each browser in the test results

## Test Reports

### HTML Report
After running tests, view the HTML report with browser-specific results:

```bash
npx playwright show-report
```

The report shows:
- Test results per browser
- Screenshots on failure (per browser)
- Execution time comparison across browsers

### Allure Report
Generate Allure reports with cross-browser results:

```bash
# Generate report
npx allure generate allure-results -o allure-report --clean

# Open report
npx allure open allure-report
```

The Allure report includes:
- Browser distribution graphs
- Pass/fail rates per browser
- Timeline of execution across browsers

## Browser-Specific Test Debugging

### Debug on Specific Browser
```bash
# Debug on Chromium
npx playwright test --project=chromium --debug

# Debug on Firefox  
npx playwright test --project=firefox --debug

# Debug on WebKit
npx playwright test --project=webkit --debug
```

### Headed Mode (See Browser UI)
```bash
# Run tests in headed mode on all browsers
npx playwright test --headed

# Run tests in headed mode on specific browser
npx playwright test --project=firefox --headed
```

## Browser Capabilities & Limitations

### Chromium
- ✅ Full feature support
- ✅ Best DevTools integration
- ✅ Chrome extensions support

### Firefox
- ✅ Full feature support
- ✅ Strong privacy controls
- ⚠️ Some Chrome-specific APIs not available

### WebKit
- ✅ Safari rendering engine
- ✅ iOS/macOS behavior testing
- ⚠️ Some modern web APIs may differ from Chromium/Firefox

## Performance Considerations

### Parallel Execution
By default, tests run in parallel across all browsers. This can be controlled via:

```bash
# Sequential execution (slower but less resource intensive)
npx playwright test --workers=1

# Parallel execution with custom worker count
npx playwright test --workers=3
```

### CI/CD Workers
In Azure Pipelines, we use 10 workers for parallel execution across browsers:
```yaml
npx playwright test --config=playwright.service.config.ts --workers=10
```

## Best Practices

### 1. Write Browser-Agnostic Tests
Write tests that work across all browsers. Avoid browser-specific assumptions:

```typescript
// ✅ Good - works on all browsers
await page.click('button[data-testid="submit"]');

// ❌ Bad - relies on Chrome-specific behavior
await page.evaluate(() => window.chrome.runtime.sendMessage());
```

### 2. Use Feature Detection
For browser-specific features, use feature detection:

```typescript
const hasFeature = await page.evaluate(() => {
  return 'clipboard' in navigator;
});

if (hasFeature) {
  // Test clipboard functionality
}
```

### 3. Handle Browser-Specific Timing
Different browsers may have different rendering speeds:

```typescript
// Use waitFor methods instead of hardcoded delays
await page.waitForSelector('button:visible');
await page.waitForLoadState('networkidle');
```

### 4. Test Visual Regressions Separately
Visual differences between browsers are expected. Use browser-specific baselines:

```typescript
await expect(page).toHaveScreenshot('homepage-chromium.png', {
  maxDiffPixels: 100,
});
```

## Troubleshooting

### Browser Installation Issues
If browsers fail to install:

```bash
# Reinstall all browsers
npx playwright install --with-deps

# Install specific browser
npx playwright install chromium
npx playwright install firefox
npx playwright install webkit
```

### Browser-Specific Test Failures
If a test fails on one browser but passes on others:

1. Run the test on that specific browser with debug mode:
   ```bash
   npx playwright test --project=firefox --debug
   ```

2. Check for browser-specific timing issues:
   - Add appropriate waits
   - Use `waitForLoadState()` or `waitForSelector()`

3. Review browser console logs in the HTML report

### Performance Issues
If tests are slow with all browsers:

```bash
# Run browsers sequentially
npx playwright test --workers=1

# Run on fewer browsers during development
npx playwright test --project=chromium
```

## Disabling Cross-Browser Testing

If you want to temporarily disable multi-browser testing:

### Option 1: Use --project flag
```bash
npx playwright test --project=chromium
```

### Option 2: Comment out browsers in playwright.config.ts
Edit `playwright.config.ts` and comment out unwanted browsers:

```typescript
projects: [
  {
    name: 'chromium',
    use: { ...devices['Desktop Chrome'], headless: false },
  },
  // {
  //   name: 'firefox',
  //   use: { ...devices['Desktop Firefox'], headless: false },
  // },
  // {
  //   name: 'webkit',
  //   use: { ...devices['Desktop Safari'], headless: false },
  // },
]
```

## Additional Resources

- [Playwright Browser Configuration](https://playwright.dev/docs/test-configuration#projects)
- [Cross-Browser Testing Best Practices](https://playwright.dev/docs/browsers)
- [Microsoft Playwright Testing](https://aka.ms/playwright/docs)
