import { BookingDetails } from "../pages/EventDetailPage";
import { EventFormData } from "../pages/EventsPage";

/**
 * Test Context Class
 *
 * Provides a structured container for managing and sharing test data
 * throughout test execution. Organizes data into logical groups and
 * provides helper methods for common operations.
 *
 * Use this when:
 * - Tests have multiple steps with shared data
 * - Data needs to flow between different pages
 * - Helper functions need access to test data
 * - You want organized, debuggable test state
 *
 * Usage:
 * ```typescript
 * test("E2E test", async ({ pages }) => {
 *     const ctx = new TestContext();
 *     ctx.event.id = 1;
 *     ctx.booking.reference = await confirmationPage.getBookingReference();
 *     // Use ctx.booking.reference later in test
 * });
 * ```
 */
export class TestContext {
    /**
     * Event-related data
     */
    public event: {
        id?: number;
        name?: string;
        title?: string;
        price?: number;
        pricePerTicket?: number;
        date?: string;
        venue?: string;
        category?: string;
        totalSeats?: number;
        availableSeats?: number;
        data?: EventFormData;
    } = {};

    /**
     * Booking-related data
     */
    public booking: {
        data?: BookingDetails;
        reference?: string;
        id?: number | string;
        totalPrice?: number;
        numberOfTickets?: number;
        confirmationDate?: Date;
        status?: string;
    } = {};

    /**
     * User-related data
     */
    public user: {
        email?: string;
        name?: string;
        id?: number;
        phoneNumber?: string;
        isAuthenticated?: boolean;
        role?: string;
    } = {};

    /**
     * Test metadata
     */
    public metadata: {
        testName?: string;
        startTime?: Date;
        endTime?: Date;
        tags?: string[];
        environment?: string;
        browser?: string;
        lastError?: Error;
        failedStep?: string;
        screenshots?: string[];
        testCase?: any;
    } = {};

    /**
     * API response data (for API tests)
     */
    public api: {
        lastRequest?: any;
        lastResponse?: any;
        token?: string;
        statusCode?: number;
    } = {};

    /**
     * Custom data storage for test-specific needs
     */
    public custom: Record<string, any> = {};

    // ==================== BOOKING METHODS ====================

    /**
     * Set booking data
     */
    setBookingData(data: BookingDetails): void {
        if (!data) {
            throw new Error("Booking data cannot be null or undefined");
        }
        this.booking.data = data;
        this.booking.numberOfTickets = data.numberOfTickets;
    }

    /**
     * Get booking data
     */
    getBookingData(): BookingDetails {
        if (!this.booking.data) {
            throw new Error("Booking data not set in test context. Did you create a booking?");
        }
        return this.booking.data;
    }

    /**
     * Set booking reference
     */
    setBookingReference(reference: string): void {
        if (!reference || reference.trim() === "") {
            throw new Error("Booking reference cannot be empty");
        }
        this.booking.reference = reference;
    }

    /**
     * Get booking reference
     */
    getBookingReference(): string {
        if (!this.booking.reference) {
            throw new Error("Booking reference not set in test context. Did you complete the booking?");
        }
        return this.booking.reference;
    }

    /**
     * Set booking ID
     */
    setBookingId(id: number | string): void {
        if (!id) {
            throw new Error("Booking ID cannot be empty");
        }
        this.booking.id = id;
    }

    /**
     * Get booking ID
     */
    getBookingId(): number | string {
        if (!this.booking.id) {
            throw new Error("Booking ID not set in test context");
        }
        return this.booking.id;
    }

    /**
     * Set total price
     */
    setTotalPrice(price: number): void {
        if (price < 0) {
            throw new Error("Total price cannot be negative");
        }
        this.booking.totalPrice = price;
    }

    /**
     * Check if booking exists
     */
    hasBooking(): boolean {
        return !!this.booking.reference || !!this.booking.id;
    }

    // ==================== EVENT METHODS ====================

    /**
     * Set event ID
     */
    setEventId(id: number): void {
        if (!id || id <= 0) {
            throw new Error("Event ID must be a positive number");
        }
        this.event.id = id;
    }

    /**
     * Get event ID
     */
    getEventId(): number {
        if (!this.event.id) {
            throw new Error("Event ID not set in test context");
        }
        return this.event.id;
    }

    /**
     * Set event name/title
     */
    setEventName(name: string): void {
        if (!name || name.trim() === "") {
            throw new Error("Event name cannot be empty");
        }
        this.event.name = name;
        this.event.title = name; // Keep both for compatibility
    }

    /**
     * Get event name
     */
    getEventName(): string {
        const name = this.event.name || this.event.title;
        if (!name) {
            throw new Error("Event name not set in test context");
        }
        return name;
    }

    /**
     * Set event data
     */
    setEventData(data: EventFormData): void {
        if (!data) {
            throw new Error("Event data cannot be null or undefined");
        }
        this.event.data = data;
        this.event.title = data.title;
        this.event.price = data.price;
    }

    // ==================== USER METHODS ====================

    /**
     * Set user data
     */
    setUser(email: string, name?: string): void {
        if (!email || email.trim() === "") {
            throw new Error("User email cannot be empty");
        }
        this.user.email = email;
        if (name) {
            this.user.name = name;
        }
    }

    /**
     * Get user email
     */
    getUserEmail(): string {
        if (!this.user.email) {
            throw new Error("User email not set in test context");
        }
        return this.user.email;
    }

    /**
     * Mark user as authenticated
     */
    markAuthenticated(isAuth: boolean = true): void {
        this.user.isAuthenticated = isAuth;
    }

    // ==================== METADATA METHODS ====================

    /**
     * Start test timer
     */
    startTest(testName: string, tags?: string[]): void {
        this.metadata.testName = testName;
        this.metadata.startTime = new Date();
        if (tags) {
            this.metadata.tags = tags;
        }
    }

    /**
     * End test timer
     */
    endTest(): void {
        this.metadata.endTime = new Date();
    }

    /**
     * Get test duration in milliseconds
     */
    getTestDuration(): number {
        if (!this.metadata.startTime) {
            throw new Error("Test start time not set");
        }
        const endTime = this.metadata.endTime || new Date();
        return endTime.getTime() - this.metadata.startTime.getTime();
    }

    /**
     * Record error
     */
    recordError(error: Error, step?: string): void {
        this.metadata.lastError = error;
        if (step) {
            this.metadata.failedStep = step;
        }
    }

    /**
     * Add screenshot path
     */
    addScreenshot(path: string): void {
        if (!this.metadata.screenshots) {
            this.metadata.screenshots = [];
        }
        this.metadata.screenshots.push(path);
    }

    // ==================== API METHODS ====================

    /**
     * Set API token
     */
    setApiToken(token: string): void {
        if (!token || token.trim() === "") {
            throw new Error("API token cannot be empty");
        }
        this.api.token = token;
    }

    /**
     * Get API token
     */
    getApiToken(): string {
        if (!this.api.token) {
            throw new Error("API token not set in test context");
        }
        return this.api.token;
    }

    /**
     * Record API request
     */
    recordApiRequest(request: any): void {
        this.api.lastRequest = request;
    }

    /**
     * Record API response
     */
    recordApiResponse(response: any, statusCode?: number): void {
        this.api.lastResponse = response;
        if (statusCode !== undefined) {
            this.api.statusCode = statusCode;
        }
    }

    // ==================== UTILITY METHODS ====================

    /**
     * Clear all context data
     */
    clear(): void {
        this.event = {};
        this.booking = {};
        this.user = {};
        this.metadata = {};
        this.api = {};
        this.custom = {};
    }

    /**
     * Get all context as JSON string
     * Useful for debugging and logging
     */
    toJSON(): string {
        return JSON.stringify(
            {
                event: this.event,
                booking: this.booking,
                user: this.user,
                metadata: {
                    ...this.metadata,
                    lastError: this.metadata.lastError?.message // Only include error message
                },
                api: {
                    ...this.api,
                    token: this.api.token ? "***REDACTED***" : undefined // Redact token
                },
                custom: this.custom
            },
            null,
            2
        );
    }

    /**
     * Get summary of context (key data only)
     */
    getSummary(): string {
        const summary: string[] = [];

        if (this.event.id || this.event.name) {
            summary.push(`Event: ${this.event.name || 'N/A'} (ID: ${this.event.id || 'N/A'})`);
        }

        if (this.booking.reference || this.booking.id) {
            summary.push(`Booking: ${this.booking.reference || this.booking.id}`);
        }

        if (this.booking.numberOfTickets) {
            summary.push(`Tickets: ${this.booking.numberOfTickets}`);
        }

        if (this.booking.totalPrice) {
            summary.push(`Total: $${this.booking.totalPrice}`);
        }

        if (this.user.email) {
            summary.push(`User: ${this.user.email}`);
        }

        return summary.join(" | ");
    }

    /**
     * Clone context (create a copy)
     */
    clone(): TestContext {
        const newContext = new TestContext();
        newContext.event = { ...this.event };
        newContext.booking = { ...this.booking };
        newContext.user = { ...this.user };
        newContext.metadata = { ...this.metadata };
        newContext.api = { ...this.api };
        newContext.custom = { ...this.custom };
        return newContext;
    }

    /**
     * Store custom data
     */
    set(key: string, value: any): void {
        this.custom[key] = value;
    }

    /**
     * Get custom data
     */
    get(key: string): any {
        return this.custom[key];
    }

    /**
     * Check if custom key exists
     */
    has(key: string): boolean {
        return key in this.custom;
    }
}

/**
 * Export default
 */
export default TestContext;
