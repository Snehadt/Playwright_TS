import { Locator, Page } from "@playwright/test";
import { BasePage } from "./BasePage";
import { getUIUrl, UI_ENDPOINTS } from "../config/urls";

/**
 * Type definition for booking form data
 */
export interface BookingFormData {
    name: string;
    email: string;
    numberOfTickets: number;
}

/**
 * Type definition for event card data
 */
export interface EventCardData {
    title: string;
    category: string;
    city: string;
    venue: string;
    price: string;
    availableSeats: string;
}

/**
 * Page Object: Book Event Page
 * Handles event browsing, filtering, and booking functionality
 */
export class BookEventPage extends BasePage {

    // Navigation
    readonly browseEventBtn: Locator;
    readonly eventsPageHeader: Locator;

    // Event List and Filtering
    readonly eventCards: Locator;
    readonly eventTitles: Locator;
    readonly searchInput: Locator;
    readonly categoryFilter: Locator;
    readonly cityFilter: Locator;

    // Event Card Details
    readonly eventCardTitle: (title: string) => Locator;
    readonly eventCardCategory: (title: string) => Locator;
    readonly eventCardCity: (title: string) => Locator;
    readonly eventCardPrice: (title: string) => Locator;
    readonly eventCardSeats: (title: string) => Locator;
    readonly bookNowBtn: (title: string) => Locator;

    // Booking Modal
    readonly bookingModal: Locator;
    readonly bookingModalTitle: Locator;
    readonly nameInput: Locator;
    readonly emailInput: Locator;
    readonly ticketsInput: Locator;
    readonly confirmBookingBtn: Locator;
    readonly cancelBookingBtn: Locator;

    // Confirmation
    readonly successMessage: Locator;
    readonly bookingConfirmationId: Locator;

    constructor(page: Page) {
        super(page);

        // Navigation
        this.browseEventBtn = page.getByRole('button', { name: /Browse Events/i });
        this.eventsPageHeader = page.locator('h1, h2').filter({ hasText: /Events/i });

        // Event List - Card/Grid layout (NOT table)
        this.eventCards = page.locator('article, .event-card, div').filter({ has: page.locator('h3.font-semibold') });
        this.eventTitles = page.locator('h3.font-semibold.text-gray-900');
        this.searchInput = page.getByPlaceholder(/Search events/i);
        this.categoryFilter = page.locator('#category-filter, select[name="category"]');
        this.cityFilter = page.locator('#city-filter, select[name="city"]');

        // Event Card Details (card-based layout)
        this.eventCardTitle = (title: string) => page.locator(`article:has(h3:has-text("${title}")), div:has(h3:has-text("${title}"))`).first();
        this.eventCardCategory = (title: string) => this.eventCardTitle(title).locator('.category, span').filter({ hasText: /Technology|Music|Sports|Arts|Conference/i }).first();
        this.eventCardCity = (title: string) => this.eventCardTitle(title).locator('.city, .location, span').filter({ hasText: /New York|San Francisco|Los Angeles|Chicago|Delhi|Mumbai/i }).first();
        this.eventCardPrice = (title: string) => this.eventCardTitle(title).locator('.price, span').filter({ hasText: /\$|₹|Free/i }).first();
        this.eventCardSeats = (title: string) => this.eventCardTitle(title).locator('.seats, span').filter({ hasText: /seat|available/i }).first();
        this.bookNowBtn = (title: string) => this.eventCardTitle(title).locator('button, a').filter({ hasText: /book|register|view/i }).first();

        // Booking Modal
        this.bookingModal = page.locator('[role="dialog"], .modal, [data-testid="booking-modal"]').filter({ hasText: /Book Event|Booking Details/i });
        this.bookingModalTitle = this.bookingModal.locator('h2, h3, [data-testid="modal-title"]').first();
        this.nameInput = page.getByLabel(/Name/i).or(page.getByPlaceholder(/Your name/i));
        this.emailInput = page.getByLabel(/Email/i).or(page.getByPlaceholder(/Your email/i));
        this.ticketsInput = page.getByLabel(/Number of tickets|Tickets/i).or(page.locator('input[type="number"]'));
        this.confirmBookingBtn = page.getByRole('button', { name: /Confirm|Book Now|Submit/i });
        this.cancelBookingBtn = page.getByRole('button', { name: /Cancel|Close/i });

        // Confirmation
        this.successMessage = page.locator('.success, [role="alert"], .alert-success').filter({ hasText: /success|booked|confirmed/i });
        this.bookingConfirmationId = page.locator('[data-testid="booking-id"], .booking-reference');
    }

    /**
     * Navigate to events page by clicking Browse Events button
     */
    async clickBrowseEventButton(): Promise<this> {
        await this.browseEventBtn.click();
        await this.page.waitForURL(/events/, { timeout: 5000 });
        return this;
    }

    /**
     * Navigate directly to events page
     */
    async navigateToEventsPage(): Promise<this> {
        await this.navigateTo(getUIUrl(UI_ENDPOINTS.EVENTS), 'networkidle');
        return this;
    }

    /**
     * Get all event titles currently visible on the page
     * @returns Array of event title strings
     */
    async getAllEventTitles(): Promise<string[]> {
        await this.eventTitles.first().waitFor({ timeout: 10000 });
        const count = await this.eventTitles.count();
        const titles: string[] = [];

        for (let i = 0; i < count; i++) {
            const title = await this.eventTitles.nth(i).textContent();
            if (title) titles.push(title.trim());
        }

        return titles;
    }

    /**
     * Find and filter event by exact title match
     * @param eventTitle - Exact event title to search for
     * @returns true if event found, false otherwise
     */
    async findEventByTitle(eventTitle: string): Promise<boolean> {
        const allTitles = await this.getAllEventTitles();
        return allTitles.some(title => title.toLowerCase().includes(eventTitle.toLowerCase()));
    }

    /**
     * Get event card details
     * @param eventTitle - Title of the event
     * @returns Event card data object
     */
    async getEventDetails(eventTitle: string): Promise<Partial<EventCardData>> {
        const eventCard = this.eventCardTitle(eventTitle);
        await eventCard.waitFor({ timeout: 5000 });

        const details: Partial<EventCardData> = {
            title: eventTitle
        };

        // Try to get category (may not exist)
        try {
            details.category = await this.eventCardCategory(eventTitle).textContent() || '';
        } catch { /* ignore */ }

        // Try to get city
        try {
            details.city = await this.eventCardCity(eventTitle).textContent() || '';
        } catch { /* ignore */ }

        // Try to get price
        try {
            details.price = await this.eventCardPrice(eventTitle).textContent() || '';
        } catch { /* ignore */ }

        // Try to get available seats
        try {
            details.availableSeats = await this.eventCardSeats(eventTitle).textContent() || '';
        } catch { /* ignore */ }

        return details;
    }

    /**
     * Click Book Now button for specific event
     * @param eventTitle - Title of event to book
     */
    async clickBookNow(eventTitle: string): Promise<this> {
        const bookBtn = this.bookNowBtn(eventTitle);
        await bookBtn.waitFor({ state: 'visible', timeout: 5000 });
        await bookBtn.click();
        return this;
    }

    /**
     * Fill booking form
     * @param bookingData - Booking form data
     */
    async fillBookingForm(bookingData: BookingFormData): Promise<this> {
        await this.bookingModal.waitFor({ state: 'visible', timeout: 5000 });

        await this.nameInput.fill(bookingData.name);
        await this.emailInput.fill(bookingData.email);
        await this.ticketsInput.fill(bookingData.numberOfTickets.toString());
        return this;
    }

    /**
     * Confirm booking by clicking confirm button
     */
    async confirmBooking(): Promise<this> {
        await this.confirmBookingBtn.click();
        return this;
    }

    /**
     * Cancel booking
     */
    async cancelBooking(): Promise<this> {
        await this.cancelBookingBtn.click();
        return this;
    }

    /**
     * Complete booking flow: find event, click book, fill form, confirm
     * @param eventTitle - Title of event to book (e.g., "World Tech Summit")
     * @param bookingData - Booking information
     */
    async bookEvent(eventTitle: string, bookingData: BookingFormData): Promise<this> {
        // Find and click the event
        const eventFound = await this.findEventByTitle(eventTitle);
        if (!eventFound) {
            throw new Error(`Event "${eventTitle}" not found in the list`);
        }

        await this.clickBookNow(eventTitle);

        // Fill booking form
        await this.fillBookingForm(bookingData);

        // Confirm booking
        await this.confirmBooking();
        return this;
    }

    /**
     * Verify booking success message is displayed
     * @returns true if success message visible
     */
    async isBookingSuccessful(): Promise<boolean> {
        try {
            await this.successMessage.waitFor({ state: 'visible', timeout: 5000 });
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Get booking confirmation ID
     * @returns Booking confirmation ID string
     */
    async getBookingConfirmationId(): Promise<string | null> {
        try {
            return await this.bookingConfirmationId.textContent();
        } catch {
            return null;
        }
    }

    /**
     * Filter events by searching for specific event name
     * @param eventName - Event name to search (e.g., "World Tech Summit")
     */
    async filterEventByName(eventName: string): Promise<this> {
        if (await this.searchInput.isVisible()) {
            await this.searchInput.fill(eventName);
            await this.page.waitForTimeout(1000); // Wait for filtering
        }
        return this;
    }

    /**
     * Wait for events to load
     */
    async waitForEventsToLoad(): Promise<this> {
        await this.eventCards.first().waitFor({ state: 'visible', timeout: 10000 });
        return this;
    }
}
