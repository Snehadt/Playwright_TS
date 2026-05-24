import { test as base, Page } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { EventsPage } from "../pages/EventsPage";
import { BookEventPage } from "../pages/BookEventPage";
import { EventDetailPage } from "../pages/EventDetailPage";
import { BookingConfirmationPage } from "../pages/BookingConfirmationPage";
import { MyBookingsPage } from "../pages/MyBookingsPage";
import { authenticateViaAPI } from "../utils/authHelper";
import { getCredentials } from "../utils/configHelper";

/**
 * Custom Fixtures Type Definition
 * Extends Playwright's base test with page objects and utilities
 */
type PageFixtures = {
    loginPage: LoginPage;
    eventsPage: EventsPage;
    bookEventPage: BookEventPage;
    eventDetailPage: EventDetailPage;
    confirmationPage: BookingConfirmationPage;
    myBookingsPage: MyBookingsPage;
    authenticatedPage: Page;  // Page with authentication already set up
};

/**
 * Extended test with custom fixtures
 * Usage: import { test, expect } from '../fixtures/pageFixtures';
 */
export const test = base.extend<PageFixtures>({
    /**
     * LoginPage fixture
     * Automatically instantiated with the current page
     */
    loginPage: async ({ page }, use) => {
        const loginPage = new LoginPage(page);
        await use(loginPage);
    },

    /**
     * EventsPage fixture
     * Automatically instantiated with the current page
     */
    eventsPage: async ({ page }, use) => {
        const eventsPage = new EventsPage(page);
        await use(eventsPage);
    },

    /**
     * BookEventPage fixture
     * Automatically instantiated with the current page
     */
    bookEventPage: async ({ page }, use) => {
        const bookEventPage = new BookEventPage(page);
        await use(bookEventPage);
    },

    /**
     * EventDetailPage fixture
     * Automatically instantiated with the current page
     */
    eventDetailPage: async ({ page }, use) => {
        const eventDetailPage = new EventDetailPage(page);
        await use(eventDetailPage);
    },

    /**
     * BookingConfirmationPage fixture
     * Automatically instantiated with the current page
     */
    confirmationPage: async ({ page }, use) => {
        const confirmationPage = new BookingConfirmationPage(page);
        await use(confirmationPage);
    },

    /**
     * MyBookingsPage fixture
     * Automatically instantiated with the current page
     */
    myBookingsPage: async ({ page }, use) => {
        const myBookingsPage = new MyBookingsPage(page);
        await use(myBookingsPage);
    },

    /**
     * Authenticated Page fixture
     * Provides a page that is already authenticated via API
     * Saves time by skipping UI login for tests that don't need to test login
     */
    authenticatedPage: async ({ page }, use) => {
        const { email, password } = getCredentials();
        await authenticateViaAPI(page, email, password);
        await use(page);
    },
});

/**
 * Export expect and request from Playwright
 * Allows single import: import { test, expect, request } from '../fixtures/pageFixtures'
 */
export { expect, request } from "@playwright/test";
