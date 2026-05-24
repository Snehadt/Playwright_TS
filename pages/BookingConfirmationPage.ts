import { Locator, Page } from "@playwright/test";
import { BasePage } from "./BasePage";

/**
 * Type definition for booking confirmation details
 */
export interface BookingConfirmation {
    bookingReference: string;
    customerName: string;
    numberOfTickets: number;
    totalPrice: number;
    eventDate?: string;
    eventTime?: string;
}

/**
 * Page Object: Booking Confirmation Page
 * Handles validation of booking confirmation details
 */
export class BookingConfirmationPage extends BasePage {

    // Confirmation Modal Elements
    readonly confirmationModal: Locator;
    readonly confirmationTitle: Locator;
    readonly bookingRefLabel: Locator;
    readonly bookingReference: Locator;
    readonly customerLabel: Locator;
    readonly customerName: Locator;
    readonly ticketsLabel: Locator;
    readonly numberOfTickets: Locator;
    readonly totalLabel: Locator;
    readonly totalPrice: Locator;

    // Event Details (on page)
    readonly eventTitle: Locator;
    readonly eventDate: Locator;
    readonly eventTime: Locator;

    // Action Buttons
    readonly viewMyBookingsBtn: Locator;
    readonly browseMoreEventsBtn: Locator;

    constructor(page: Page) {
        super(page);

        // Confirmation Modal Locators
        this.confirmationModal = page.locator('div, [role="dialog"]').filter({ hasText: /Booking Confirmed/i }).first();
        this.confirmationTitle = page.locator('text=/Booking Confirmed|🎉/i').first();
        this.bookingRefLabel = page.locator('text=/Booking Ref/i').first();
        this.bookingReference = page.locator('text=/Booking Ref/i').locator('..').locator('text=/[A-Z0-9]{5,}/').first();
        this.customerLabel = page.locator('text=/Customer/i').filter({ hasNotText: /email/i }).first();
        this.customerName = page.locator('text=/Customer/i').locator('..').locator('text=/[A-Z][a-z]+\\s+[A-Z][a-z]+/i').first();
        this.ticketsLabel = page.locator('text=/^Tickets$/i').first();
        this.numberOfTickets = page.locator('text=/^Tickets$/i').locator('..').locator('text=/\\d+/').first();
        this.totalLabel = page.locator('text=/^Total$/i').first();
        this.totalPrice = page.locator('text=/^Total$/i').locator('..').locator('text=/\\$[\\d,]+|₹[\\d,]+/').first();

        // Event Details
        this.eventTitle = page.locator('h1, h2').filter({ hasText: /Tech|Summit|Conference/i }).first();
        this.eventDate = page.locator('text=/Saturday|Sunday|Monday|Tuesday|Wednesday|Thursday|Friday/i').first();
        this.eventTime = page.locator('text=/\\d{1,2}:\\d{2}\\s*(am|pm)/i').first();

        // Action Buttons (prioritize button over nav link)
        this.viewMyBookingsBtn = page.locator('button:has-text("View My Bookings")');
        this.browseMoreEventsBtn = page.locator('button:has-text("Browse More Events")');
    }

    /**
     * Wait for confirmation modal to appear
     * @param timeout - Timeout in milliseconds
     */
    async waitForConfirmationModal(timeout: number = 10000): Promise<this> {
        await this.confirmationTitle.waitFor({ state: 'visible', timeout });
        return this;
    }

    /**
     * Get booking reference number
     * @returns Booking reference string
     */
    async getBookingReference(): Promise<string> {
        await this.bookingReference.waitFor({ timeout: 5000 });
        return await this.bookingReference.textContent() || '';
    }

    /**
     * Get customer name from confirmation
     * @returns Customer name
     */
    async getCustomerName(): Promise<string> {
        await this.customerName.waitFor({ timeout: 5000 });
        return await this.customerName.textContent() || '';
    }

    /**
     * Get number of tickets
     * @returns Number of tickets
     */
    async getNumberOfTickets(): Promise<number> {
        await this.numberOfTickets.waitFor({ timeout: 5000 });
        const text = await this.numberOfTickets.textContent() || '0';
        return parseInt(text);
    }

    /**
     * Get total price
     * @returns Total price as number
     */
    async getTotalPrice(): Promise<number> {
        await this.totalPrice.waitFor({ timeout: 5000 });
        const text = await this.totalPrice.textContent() || '0';
        const match = text.match(/[\d,]+/);
        return match ? parseInt(match[0].replace(/,/g, '')) : 0;
    }

    /**
     * Get event date
     * @returns Event date string
     */
    async getEventDate(): Promise<string> {
        try {
            return await this.eventDate.textContent() || '';
        } catch {
            return '';
        }
    }

    /**
     * Get event time
     * @returns Event time string
     */
    async getEventTime(): Promise<string> {
        try {
            return await this.eventTime.textContent() || '';
        } catch {
            return '';
        }
    }

    /**
     * Get all confirmation details
     * @returns BookingConfirmation object
     */
    async getConfirmationDetails(): Promise<BookingConfirmation> {
        return {
            bookingReference: await this.getBookingReference(),
            customerName: await this.getCustomerName(),
            numberOfTickets: await this.getNumberOfTickets(),
            totalPrice: await this.getTotalPrice(),
            eventDate: await this.getEventDate(),
            eventTime: await this.getEventTime()
        };
    }

    /**
     * Validate booking confirmation
     * @param expectedName - Expected customer name
     * @param expectedTickets - Expected number of tickets
     * @param expectedTotal - Expected total price
     * @returns true if all validations pass
     */
    async validateBookingConfirmation(
        expectedName: string,
        expectedTickets: number,
        expectedTotal: number
    ): Promise<boolean> {
        const details = await this.getConfirmationDetails();

        const nameMatch = details.customerName.toLowerCase().includes(expectedName.toLowerCase());
        const ticketsMatch = details.numberOfTickets === expectedTickets;
        const priceMatch = details.totalPrice === expectedTotal;

        console.log(`\n=== Booking Validation ===`);
        console.log(`Booking Ref: ${details.bookingReference}`);
        console.log(`Customer: ${details.customerName} (Expected: ${expectedName}) - ${nameMatch ? '✓' : '✗'}`);
        console.log(`Tickets: ${details.numberOfTickets} (Expected: ${expectedTickets}) - ${ticketsMatch ? '✓' : '✗'}`);
        console.log(`Total: ${details.totalPrice} (Expected: ${expectedTotal}) - ${priceMatch ? '✓' : '✗'}`);
        console.log(`Event Date: ${details.eventDate}`);
        console.log(`Event Time: ${details.eventTime}`);

        return nameMatch && ticketsMatch && priceMatch;
    }

    /**
     * Verify booking reference format
     * @returns true if booking reference matches expected format
     */
    async verifyBookingReferenceFormat(): Promise<boolean> {
        const ref = await this.getBookingReference();
        // Expected format: W-XXXXX (letter, dash, alphanumeric)
        const formatRegex = /^[A-Z]-[A-Z0-9]{5,}$/;
        return formatRegex.test(ref);
    }

    /**
     * Click View My Bookings button
     */
    async clickViewMyBookings(): Promise<this> {
        await this.viewMyBookingsBtn.waitFor({ state: 'visible', timeout: 5000 });
        await this.viewMyBookingsBtn.click();
        return this;
    }

    /**
     * Click Browse More Events button
     */
    async clickBrowseMoreEvents(): Promise<this> {
        await this.browseMoreEventsBtn.waitFor({ state: 'visible', timeout: 5000 });
        await this.browseMoreEventsBtn.click();
        return this;
    }

    /**
     * Check if confirmation modal is visible
     * @returns true if modal is visible
     */
    async isConfirmationVisible(): Promise<boolean> {
        try {
            await this.confirmationTitle.waitFor({ state: 'visible', timeout: 3000 });
            return true;
        } catch {
            return false;
        }
    }
}
