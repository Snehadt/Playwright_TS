import { Page, Locator, expect } from "@playwright/test";

/**
 * Base Page Object
 * Contains common methods and utilities shared across all page objects
 * All page objects should extend this class to inherit common functionality
 */
export abstract class BasePage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    /**
     * Navigate to a specific URL
     * @param url - URL to navigate to
     * @param waitUntil - Wait condition (default: 'domcontentloaded')
     */
    async navigateTo(url: string, waitUntil: 'load' | 'domcontentloaded' | 'networkidle' = 'domcontentloaded'): Promise<this> {
        await this.page.goto(url, { waitUntil, timeout: 30000 });
        return this;
    }

    /**
     * Get current page URL
     */
    getCurrentUrl(): string {
        return this.page.url();
    }

    /**
     * Get page title
     */
    async getPageTitle(): Promise<string> {
        return await this.page.title();
    }

    /**
     * Wait for page to load completely
     * @param state - Load state to wait for
     */
    async waitForPageLoad(state: 'load' | 'domcontentloaded' | 'networkidle' = 'networkidle'): Promise<this> {
        await this.page.waitForLoadState(state);
        return this;
    }

    /**
     * Wait for a specific locator to be visible
     * @param locator - Playwright locator
     * @param timeout - Timeout in milliseconds (default: 10000)
     */
    async waitForElement(locator: Locator, timeout: number = 10000): Promise<this> {
        await locator.waitFor({ state: 'visible', timeout });
        return this;
    }

    /**
     * Wait for a specific locator to be hidden
     * @param locator - Playwright locator
     * @param timeout - Timeout in milliseconds (default: 10000)
     */
    async waitForElementHidden(locator: Locator, timeout: number = 10000): Promise<this> {
        await locator.waitFor({ state: 'hidden', timeout });
        return this;
    }

    /**
     * Check if element is visible
     * @param locator - Playwright locator
     * @param timeout - Timeout in milliseconds (default: 5000)
     */
    async isVisible(locator: Locator, timeout: number = 5000): Promise<boolean> {
        try {
            await locator.waitFor({ state: 'visible', timeout });
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Click on an element with automatic wait
     * @param locator - Playwright locator
     */
    async clickElement(locator: Locator): Promise<this> {
        await locator.waitFor({ state: 'visible', timeout: 10000 });
        await locator.click();
        return this;
    }

    /**
     * Fill text input with automatic wait
     * @param locator - Playwright locator
     * @param text - Text to fill
     */
    async fillText(locator: Locator, text: string): Promise<this> {
        await locator.waitFor({ state: 'visible', timeout: 10000 });
        await locator.fill(text);
        return this;
    }

    /**
     * Get text content from element
     * @param locator - Playwright locator
     */
    async getTextContent(locator: Locator): Promise<string> {
        await locator.waitFor({ state: 'visible', timeout: 10000 });
        return await locator.textContent() || '';
    }

    /**
     * Get input value
     * @param locator - Playwright locator
     */
    async getInputValue(locator: Locator): Promise<string> {
        await locator.waitFor({ state: 'visible', timeout: 10000 });
        return await locator.inputValue();
    }

    /**
     * Select option from dropdown
     * @param locator - Playwright locator
     * @param value - Option value to select
     */
    async selectOption(locator: Locator, value: string): Promise<this> {
        await locator.waitFor({ state: 'visible', timeout: 10000 });
        await locator.selectOption(value);
        return this;
    }

    /**
     * Check if current URL contains text
     * @param text - Text to check in URL
     */
    urlContains(text: string): boolean {
        return this.page.url().includes(text);
    }

    /**
     * Wait for URL to contain specific text
     * @param text - Text to wait for in URL
     * @param timeout - Timeout in milliseconds (default: 10000)
     */
    async waitForUrlContains(text: string, timeout: number = 10000): Promise<this> {
        await this.page.waitForURL(new RegExp(text), { timeout });
        return this;
    }

    /**
     * Reload the current page
     */
    async reloadPage(): Promise<this> {
        await this.page.reload();
        await this.waitForPageLoad();
        return this;
    }

    /**
     * Take a screenshot
     * @param name - Screenshot filename
     */
    async takeScreenshot(name: string): Promise<this> {
        await this.page.screenshot({ path: `screenshots/${name}.png`, fullPage: true });
        return this;
    }

    /**
     * Execute JavaScript in browser context
     * @param script - JavaScript function to execute
     */
    async executeScript<T>(script: () => T): Promise<T> {
        return await this.page.evaluate(script);
    }

    /**
     * Scroll element into view
     * @param locator - Playwright locator
     */
    async scrollToElement(locator: Locator): Promise<this> {
        await locator.scrollIntoViewIfNeeded();
        return this;
    }

    /**
     * Get count of elements matching locator
     * @param locator - Playwright locator
     */
    async getElementCount(locator: Locator): Promise<number> {
        return await locator.count();
    }

    /**
     * Wait for specific amount of time (use sparingly)
     * @param ms - Milliseconds to wait
     */
    async wait(ms: number): Promise<this> {
        await this.page.waitForTimeout(ms);
        return this;
    }

    /**
     * Check if element exists in DOM (doesn't need to be visible)
     * @param locator - Playwright locator
     */
    async elementExists(locator: Locator): Promise<boolean> {
        return await locator.count() > 0;
    }

    /**
     * Get all text contents from multiple elements
     * @param locator - Playwright locator
     */
    async getAllTextContents(locator: Locator): Promise<string[]> {
        return await locator.allTextContents();
    }

    /**
     * Hover over an element
     * @param locator - Playwright locator
     */
    async hoverElement(locator: Locator): Promise<this> {
        await locator.waitFor({ state: 'visible', timeout: 10000 });
        await locator.hover();
        return this;
    }

    /**
     * Double click an element
     * @param locator - Playwright locator
     */
    async doubleClickElement(locator: Locator): Promise<this> {
        await locator.waitFor({ state: 'visible', timeout: 10000 });
        await locator.dblclick();
        return this;
    }

    /**
     * Press a key
     * @param key - Key to press (e.g., 'Enter', 'Escape')
     */
    async pressKey(key: string): Promise<this> {
        await this.page.keyboard.press(key);
        return this;
    }

    /**
     * Check if checkbox/radio is checked
     * @param locator - Playwright locator
     */
    async isChecked(locator: Locator): Promise<boolean> {
        return await locator.isChecked();
    }

    /**
     * Check checkbox/radio
     * @param locator - Playwright locator
     */
    async checkElement(locator: Locator): Promise<this> {
        if (!await this.isChecked(locator)) {
            await locator.check();
        }
        return this;
    }

    /**
     * Uncheck checkbox
     * @param locator - Playwright locator
     */
    async uncheckElement(locator: Locator): Promise<this> {
        if (await this.isChecked(locator)) {
            await locator.uncheck();
        }
        return this;
    }
}
