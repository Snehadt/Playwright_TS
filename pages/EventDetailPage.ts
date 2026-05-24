import { Locator, Page } from "@playwright/test";
import { BasePage } from "./BasePage";
import { getUIUrl, UI_ENDPOINTS } from "../config/urls";

/**
 * Type definition for booking details
 */
export interface BookingDetails {
    numberOfTickets: number;
    fullName: string;
    email: string;
    phoneNumber: string;
}

/**
 * Type definition for event information
 */
export interface EventInfo {
    title: string;
    description?: string;
    category?: string;
    venue?: string;
    date?: string;
    pricePerTicket: number;
    availableSeats?: number;
}

/**
 * Page Object: Event Detail Page
 * Handles event details viewing and ticket booking
 */
export class EventDetailPage extends BasePage {

    // Event Information
    readonly eventTitle: Locator;
    readonly eventDescription: Locator;
    readonly eventCategory: Locator;
    readonly eventVenue: Locator;
    readonly eventDate: Locator;
    readonly pricePerTicket: Locator;
    readonly totalPrice: Locator;
    readonly availableSeats: Locator;

    // Booking Form
    readonly ticketQuantityInput: Locator;
    readonly increaseTicketBtn: Locator;
    readonly decreaseTicketBtn: Locator;
    readonly fullNameInput: Locator;
    readonly emailInput: Locator;
    readonly phoneInput: Locator;
    readonly confirmBookingBtn: Locator;

    // Confirmation
    readonly bookingSuccessMessage: Locator;
    readonly bookingConfirmationId: Locator;

    // Error Messages
    readonly seatAvailabilityError: Locator;

    constructor(page: Page) {
        super(page);

        // Event Information Locators
        this.eventTitle = page.locator('h1, h2').first();
        this.eventDescription = page.locator('[class*="description"], p').filter({ hasText: /.{50,}/ }).first();
        this.eventCategory = page.locator('text=/Category|Conference|Technology|Music|Sports/i').first();
        this.eventVenue = page.locator('text=/Venue|Location/i').locator('..').first();
        this.eventDate = page.locator('text=/Date|Time/i').locator('..').first();
        this.pricePerTicket = page.locator('text=/\\$[\\d,]+|₹[\\d,]+/').first();
        this.totalPrice = page.locator('text=/\\$[\\d,]+|₹[\\d,]+/').nth(1);
        this.availableSeats = page.locator('text=/available|seats/i').first();

        // Booking Form Locators
        this.ticketQuantityInput = page.locator('button:has-text("+")').locator('..').locator('text=/\\d+/').first();
        this.increaseTicketBtn = page.locator('button:has-text("+")');
        this.decreaseTicketBtn = page.locator('button:has-text("−"), button:has-text("-")');
        this.fullNameInput = page.locator('input[name="customerName"]');
        this.emailInput = page.locator('input[name="customerEmail"]');
        this.phoneInput = page.locator('input[name="phone"]');
        this.confirmBookingBtn = page.locator('button:has-text("Confirm Booking")');

        // Confirmation Locators
        this.bookingSuccessMessage = page.locator('.success, [role="alert"]').filter({ hasText: /success|confirmed|booked/i });
        this.bookingConfirmationId = page.locator('[class*="booking-id"], [class*="confirmation"]').filter({ hasText: /[A-Z0-9]{5,}/ });

        // Error Message Locators
        this.seatAvailabilityError = page.locator('//p[contains(text(), "Only 0 seat(s) available, but") and contains(text(), "requested")]');
    }

    /**
     * Navigate to event detail page
     * @param eventId - Event ID to navigate to
     */
    async navigateToEventDetail(eventId: number): Promise<this> {
        await this.navigateTo(getUIUrl(UI_ENDPOINTS.EVENT_DETAIL(eventId)), 'networkidle');
        return this;
    }

    /**
     * Get event title
     * @returns Event title text
     */
    async getEventTitle(): Promise<string> {
        await this.eventTitle.waitFor({ timeout: 5000 });
        return await this.eventTitle.textContent() || '';
    }

    /**
     * Get price per ticket
     * @returns Price as a number
     */
    async getPricePerTicket(): Promise<number> {
        const priceText = await this.pricePerTicket.textContent() || '';
        const priceMatch = priceText.match(/[\d,]+/);
        if (priceMatch) {
            return parseInt(priceMatch[0].replace(/,/g, ''));
        }
        return 0;
    }

    /**
     * Get total price displayed
     * @returns Total price as a number
     */
    async getTotalPrice(): Promise<number> {
        try {
            await this.page.waitForTimeout(500);
            const allPrices = await this.page.locator('text=/\\$[\\d,]+|₹[\\d,]+/').allTextContents();

            if (allPrices.length >= 2) {
                const totalText = allPrices[allPrices.length - 1];
                const priceMatch = totalText.match(/[\d,]+/);
                if (priceMatch) {
                    return parseInt(priceMatch[0].replace(/,/g, ''));
                }
            }
        } catch {
            // Fall back
        }
        return 0;
    }

    /**
     * Get current ticket quantity
     * @returns Current quantity value
     */
    async getCurrentTicketQuantity(): Promise<number> {
        const text = await this.ticketQuantityInput.textContent() || '1';
        return parseInt(text) || 1;
    }

    /**
     * Check for seat availability error
     * @returns Error message if seats unavailable, null otherwise
     */
    async checkSeatAvailabilityError(): Promise<string | null> {
        try {
            await this.seatAvailabilityError.waitFor({ state: 'visible', timeout: 3000 });
            const errorText = await this.seatAvailabilityError.textContent();
            return errorText ? errorText.trim() : null;
        } catch {
            return null;
        }
    }

    /**
     * Set ticket quantity using +/- buttons
     * @param quantity - Number of tickets to book
     */
    async setTicketQuantity(quantity: number): Promise<this> {
        const current = await this.getCurrentTicketQuantity();
        const diff = quantity - current;

        if (diff > 0) {
            await this.increaseTicketQuantity(diff);
        } else if (diff < 0) {
            await this.decreaseTicketQuantity(Math.abs(diff));
        }
        return this;
    }

    /**
     * Increase ticket quantity using + button
     * @param times - Number of times to click increase
     */
    async increaseTicketQuantity(times: number = 1): Promise<this> {
        for (let i = 0; i < times; i++) {
            await this.increaseTicketBtn.click();
            await this.page.waitForTimeout(300);
        }
        return this;
    }

    /**
     * Decrease ticket quantity using - button
     * @param times - Number of times to click decrease
     */
    async decreaseTicketQuantity(times: number = 1): Promise<this> {
        for (let i = 0; i < times; i++) {
            await this.decreaseTicketBtn.click();
            await this.page.waitForTimeout(300);
        }
        return this;
    }

    /**
     * Verify that total price updates correctly
     * @param expectedQuantity - Expected number of tickets
     * @param pricePerTicket - Price per ticket
     * @returns true if price is correct
     */
    async verifyTotalPrice(expectedQuantity: number, pricePerTicket: number): Promise<boolean> {
        const expectedTotal = expectedQuantity * pricePerTicket;
        const actualTotal = await this.getTotalPrice();

        return actualTotal === expectedTotal;
    }

    /**
     * Fill booking form
     * @param bookingDetails - Booking details including name, email, and phone
     */
    async fillBookingForm(bookingDetails: BookingDetails): Promise<this> {
        // Set ticket quantity
        await this.setTicketQuantity(bookingDetails.numberOfTickets);

        // Fill name
        await this.fullNameInput.waitFor({ state: 'visible', timeout: 5000 });
        await this.fullNameInput.clear();
        await this.fullNameInput.fill(bookingDetails.fullName);

        // Fill email
        await this.emailInput.clear();
        await this.emailInput.fill(bookingDetails.email);

        // Fill phone number
        await this.phoneInput.clear();
        await this.phoneInput.fill(bookingDetails.phoneNumber);
        return this;
    }

    /**
     * Click confirm booking button
     * @throws Error if seat availability error is displayed
     */
    async clickConfirmBooking(): Promise<this> {
        await this.confirmBookingBtn.waitFor({ state: 'visible', timeout: 5000 });
        await this.confirmBookingBtn.click();

        // Check for seat availability error after clicking confirm
        const errorMessage = await this.checkSeatAvailabilityError();
        if (errorMessage) {
            throw new Error(`❌ Booking Failed - ${errorMessage}`);
        }

        return this;
    }

    /**
     * Complete booking flow
     * @param bookingDetails - Booking details
     * @returns Booking confirmation details
     */
    async completeBooking(bookingDetails: BookingDetails): Promise<{ success: boolean; confirmationId?: string }> {
        // Get price per ticket first
        const pricePerTicket = await this.getPricePerTicket();

        // Fill booking form
        await this.fillBookingForm(bookingDetails);

        // Verify price before booking
        const isPriceCorrect = await this.verifyTotalPrice(bookingDetails.numberOfTickets, pricePerTicket);
        if (!isPriceCorrect) {
            console.warn('⚠️ Total price mismatch before booking');
        }

        // Click confirm
        await this.clickConfirmBooking();

        // Wait for confirmation
        await this.page.waitForTimeout(2000);

        // Check for success
        try {
            await this.bookingSuccessMessage.waitFor({ state: 'visible', timeout: 5000 });
            const confirmationId = await this.bookingConfirmationId.textContent().catch(() => null);

            return {
                success: true,
                confirmationId: confirmationId || undefined
            };
        } catch {
            return { success: false };
        }
    }

    /**
     * Get all event information from the page
     * @returns Event information object
     */
    async getEventInfo(): Promise<EventInfo> {
        const title = await this.getEventTitle();
        const pricePerTicket = await this.getPricePerTicket();

        const info: EventInfo = {
            title,
            pricePerTicket
        };

        // Try to get optional fields
        try {
            info.description = await this.eventDescription.textContent() || undefined;
        } catch { /* ignore */ }

        try {
            const seatsText = await this.availableSeats.textContent() || '';
            const seatsMatch = seatsText.match(/\d+/);
            if (seatsMatch) {
                info.availableSeats = parseInt(seatsMatch[0]);
            }
        } catch { /* ignore */ }

        return info;
    }

    /**
     * Wait for page to be fully loaded
     */
    async waitForPageLoad(): Promise<this> {
        await this.eventTitle.waitFor({ state: 'visible', timeout: 10000 });
        await this.increaseTicketBtn.waitFor({ state: 'visible', timeout: 10000 });
        await this.fullNameInput.waitFor({ state: 'visible', timeout: 10000 });
        await this.page.waitForLoadState('networkidle');
        return this;
    }
}
