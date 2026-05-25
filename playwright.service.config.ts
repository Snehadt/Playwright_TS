import { defineConfig } from '@playwright/test';
import config from './playwright.config';

/* Learn more about service configuration at https://aka.ms/pww/docs/config */
export default defineConfig(config, {
  // Add reporters including Microsoft Playwright Testing reporter
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['blob'], // Required for Microsoft Playwright Testing reporting
    ['allure-playwright', {
      detail: true,
      outputFolder: 'allure-results',
      suiteTitle: false,
    }],
  ],
  use: {
    connectOptions: {
      wsEndpoint: process.env.PLAYWRIGHT_SERVICE_URL!,
      timeout: 3 * 60 * 1000, // 3 minutes
      headers: {
        'x-mpt-access-key': process.env.PLAYWRIGHT_SERVICE_ACCESS_TOKEN!,
      },
      exposeNetwork: '<loopback>',
    },
  },
});
