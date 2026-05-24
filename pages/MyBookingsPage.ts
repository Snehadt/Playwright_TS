import { Locator, Page } from "@playwright/test";
import { BasePage } from "./BasePage";
import { getUIUrl, UI_ENDPOINTS } from "../config/urls";

/**
 * Type definition for booking details from My Bookings page
 */
export interface BookingDetails {
    bookingReference: string;
    bookingId?: string;
    status: string;
    eventName: string;
    eventDate?: string;
    numberOfTickets?: number;
    venue?: string;
    bookingDate?: string;
    price?: string;
}

/**
 * Page Object: My Bookings Page
 * Handles validation and interaction with user's booking list
 */
export class MyBookingsPage extends BasePage {

    // Page Elements
    readonly pageTitle: Locator;
    readonly bookingCards: Locator;
    readonly viewDetailsButtons: Locator;

    constructor(page: Page) {
        super(page);

        // Page Locators
        this.pageTitle = page.locator('h1, h2').filter({ hasText: /My Bookings/i });
        this.bookingCards = page.locator('div, article, section').filter({ hasText: /World Tech Summit|confirmed|cancelled/i });
        this.viewDetailsButtons = page.locator('button:has-text("View Details"), a:has-text("View Details")');
    }

    /**
     * Navigate to My Bookings page
     */
    async navigateToMyBookings(): Promise<this> {
        await this.navigateTo(getUIUrl(UI_ENDPOINTS.BOOKINGS), 'networkidle');
        return this;
    }

    /**
     * Wait for bookings page to load
     */
    async waitForPageLoad(): Promise<this> {
        await this.pageTitle.waitFor({ state: 'visible', timeout: 10000 });
        await this.page.waitForLoadState('networkidle');
        return this;
    }

    /**
     * Get booking card by reference number
     * @param bookingRef - Booking reference (e.g., "W-XXXXX")
     * @returns Locator for the booking card
     */
    getBookingCardByReference(bookingRef: string): Locator {
        return this.page.locator(`text=${bookingRef}`).locator('../..');
    }

    /**
     * Check if booking exists by reference
     * @param bookingRef - Booking reference
     * @returns true if booking found
     */
    async isBookingPresent(bookingRef: string): Promise<boolean> {
        try {
            await this.page.locator(`text=${bookingRef}`).waitFor({ state: 'visible', timeout: 5000 });
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Get booking details by reference
     * @param bookingRef - Booking reference
     * @returns BookingDetails object
     */
    async getBookingDetailsByReference(bookingRef: string): Promise<BookingDetails> {
        const card = this.getBookingCardByReference(bookingRef);
        await card.waitFor({ timeout: 5000 });

        const fullText = await card.textContent() || '';

        // Extract booking ID
        const idMatch = fullText.match(/#(\d+)/);
        const bookingId = idMatch ? idMatch[1] : '';

        // Extract status
        const statusMatch = fullText.match(/confirmed|cancelled|pending/i);
        const status = statusMatch ? statusMatch[0] : 'unknown';

        // Extract event name
        const eventMatch = fullText.match(/World Tech Summit|Tech Conference|Dilli Diwali Mela/);
        const eventName = eventMatch ? eventMatch[0] : '';

        // Extract date
        const dateMatch = fullText.match(/(\d{1,2}\s+[A-Za-z]+\s+\d{4})/);
        const eventDate = dateMatch ? dateMatch[1] : '';

        // Extract tickets
        const ticketsMatch = fullText.match(/(\d+)\s+ticket/i);
        const numberOfTickets = ticketsMatch ? parseInt(ticketsMatch[1]) : undefined;

        // Extract venue
        const venueMatch = fullText.match(/📍\s*([A-Za-z\s,]+)/);
        const venue = venueMatch ? venueMatch[1].trim() : '';

        // Extract booking date
        const bookedMatch = fullText.match(/Booked\s+(\d{1,2}\s+[A-Za-z]+\s+\d{4})/);
        const bookingDate = bookedMatch ? bookedMatch[1] : '';

        return {
            bookingReference: bookingRef,
            bookingId,
            status,
            eventName,
            eventDate,
            numberOfTickets,
            venue,
            bookingDate
        };
    }

    /**
     * Validate booking details
     * @param bookingRef - Booking reference to validate
     * @param expectedEventName - Expected event name
     * @param expectedTickets - Expected number of tickets
     * @param expectedStatus - Expected status (default: "confirmed")
     * @returns true if all validations pass
     */
    async validateBooking(
        bookingRef: string,
        expectedEventName: string,
        expectedTickets: number,
        expectedStatus: string = "confirmed"
    ): Promise<boolean> {
        const details = await this.getBookingDetailsByReference(bookingRef);

        const refMatch = details.bookingReference === bookingRef;
        const eventMatch = details.eventName.toLowerCase().includes(expectedEventName.toLowerCase());
        const ticketsMatch = details.numberOfTickets === expectedTickets;
        const statusMatch = details.status.toLowerCase() === expectedStatus.toLowerCase();

        console.log(`\n=== Booking Validation ===`);
        console.log(`Booking Ref: ${details.bookingReference} - ${refMatch ? '✓' : '✗'}`);
        console.log(`Booking ID: ${details.bookingId}`);
        console.log(`Status: ${details.status} (Expected: ${expectedStatus}) - ${statusMatch ? '✓' : '✗'}`);
        console.log(`Event: ${details.eventName} (Expected: ${expectedEventName}) - ${eventMatch ? '✓' : '✗'}`);
        console.log(`Tickets: ${details.numberOfTickets} (Expected: ${expectedTickets}) - ${ticketsMatch ? '✓' : '✗'}`);
        console.log(`Event Date: ${details.eventDate}`);
        console.log(`Venue: ${details.venue}`);
        console.log(`Booking Date: ${details.bookingDate}`);

        return refMatch && eventMatch && ticketsMatch && statusMatch;
    }

    /**
     * Get all booking references on the page
     * @returns Array of booking references
     */
    async getAllBookingReferences(): Promise<string[]> {
        const refs = await this.page.locator('text=/W-[A-Z0-9]{5,}/').allTextContents();
        return refs.map(ref => ref.trim());
    }

    /**
     * Get total number of bookings
     * @returns Number of bookings
     */
    async getBookingCount(): Promise<number> {
        const refs = await this.getAllBookingReferences();
        return refs.length;
    }

    /**
     * Click View Details for a specific booking
     * @param bookingRef - Booking reference
     */
    async clickViewDetails(bookingRef: string): Promise<this> {
        const card = this.getBookingCardByReference(bookingRef);
        const viewDetailsBtn = card.locator('button:has-text("View Details"), a:has-text("View Details")');
        await viewDetailsBtn.waitFor({ state: 'visible', timeout: 5000 });
        await viewDetailsBtn.click();
        return this;
    }

    /**
     * Search for booking by event name
     * @param eventName - Event name to search
     * @returns Array of booking references for that event
     */
    async findBookingsByEvent(eventName: string): Promise<string[]> {
        const cards = await this.page.locator(`div:has-text("${eventName}")`).filter({ hasText: /W-[A-Z0-9]{5,}/ }).all();
        const refs: string[] = [];

        for (const card of cards) {
            const text = await card.textContent() || '';
            const match = text.match(/W-[A-Z0-9]{5,}/);
            if (match) refs.push(match[0]);
        }

        return refs;
    }

    /**
     * Verify booking ID format
     * @param bookingRef - Booking reference
     * @returns true if booking has valid ID
     */
    async verifyBookingIdExists(bookingRef: string): Promise<boolean> {
        const details = await this.getBookingDetailsByReference(bookingRef);
        return !!details.bookingId && details.bookingId.length > 0;
    }
}
