import { EventFormData } from "../../pages/EventsPage";

/**
 * Test Data Builder for EventFormData
 *
 * Provides a fluent API for creating test event data with sensible defaults.
 * Implements the Builder pattern for flexible, readable test data creation.
 *
 * Usage:
 * ```typescript
 * // Simple event with defaults
 * const event = new EventBuilder().build();
 *
 * // Customized event
 * const event = new EventBuilder()
 *     .withTitle("Tech Conference")
 *     .withCategory("Technology")
 *     .withPrice(100)
 *     .build();
 *
 * // Using presets
 * const techEvent = EventBuilder.techConference().build();
 * const freeEvent = EventBuilder.freeEvent().build();
 * ```
 */
export class EventBuilder {
    private title: string = `Test Event ${Date.now()}`;
    private description?: string = "This is a test event description";
    private category: string = "Technology";
    private city: string = "San Francisco";
    private venue: string = "Tech Hub Convention Center";
    private dateTime: string = this.getDefaultDateTime();
    private price: number = 50;
    private totalSeat: number = 100;
    private imageUrl?: string = "https://via.placeholder.com/600x400";

    /**
     * Set event title
     */
    withTitle(title: string): this {
        this.title = title;
        return this;
    }

    /**
     * Set event description
     */
    withDescription(description: string): this {
        this.description = description;
        return this;
    }

    /**
     * Clear description (make it optional/undefined)
     */
    withoutDescription(): this {
        this.description = undefined;
        return this;
    }

    /**
     * Set event category
     */
    withCategory(category: string): this {
        this.category = category;
        return this;
    }

    /**
     * Set city
     */
    withCity(city: string): this {
        this.city = city;
        return this;
    }

    /**
     * Set venue
     */
    withVenue(venue: string): this {
        this.venue = venue;
        return this;
    }

    /**
     * Set date and time
     */
    withDateTime(dateTime: string): this {
        this.dateTime = dateTime;
        return this;
    }

    /**
     * Set price
     */
    withPrice(price: number): this {
        this.price = price;
        return this;
    }

    /**
     * Set total seats
     */
    withTotalSeats(seats: number): this {
        this.totalSeat = seats;
        return this;
    }

    /**
     * Set image URL
     */
    withImageUrl(url: string): this {
        this.imageUrl = url;
        return this;
    }

    /**
     * Clear image URL (make it optional)
     */
    withoutImage(): this {
        this.imageUrl = undefined;
        return this;
    }

    /**
     * Get default date time (30 days from now)
     */
    private getDefaultDateTime(): string {
        const date = new Date();
        date.setDate(date.getDate() + 30);
        return date.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:mm
    }

    /**
     * Build and return the EventFormData object
     */
    build(): EventFormData {
        return {
            title: this.title,
            description: this.description,
            category: this.category,
            city: this.city,
            venue: this.venue,
            dateTime: this.dateTime,
            price: this.price,
            totalSeat: this.totalSeat,
            imageUrl: this.imageUrl
        };
    }

    // ==================== PRESET CONFIGURATIONS ====================

    /**
     * Preset: Technology Conference
     */
    static techConference(): EventBuilder {
        return new EventBuilder()
            .withTitle("Global Tech Summit 2026")
            .withDescription("Annual technology conference featuring latest innovations")
            .withCategory("Technology")
            .withCity("San Francisco")
            .withVenue("Moscone Center")
            .withPrice(299)
            .withTotalSeats(5000);
    }

    /**
     * Preset: Free event
     */
    static freeEvent(): EventBuilder {
        return new EventBuilder()
            .withTitle("Community Meetup")
            .withDescription("Free community networking event")
            .withCategory("Community")
            .withPrice(0)
            .withTotalSeats(50);
    }

    /**
     * Preset: Music concert
     */
    static musicConcert(): EventBuilder {
        return new EventBuilder()
            .withTitle("Rock Festival 2026")
            .withDescription("Three-day music festival featuring top artists")
            .withCategory("Music")
            .withCity("Austin")
            .withVenue("Austin Music Hall")
            .withPrice(150)
            .withTotalSeats(10000);
    }

    /**
     * Preset: Sports event
     */
    static sportsEvent(): EventBuilder {
        return new EventBuilder()
            .withTitle("Championship Finals")
            .withDescription("Season championship final match")
            .withCategory("Sports")
            .withCity("New York")
            .withVenue("Madison Square Garden")
            .withPrice(200)
            .withTotalSeats(20000);
    }

    /**
     * Preset: Minimal valid event
     * Only required fields
     */
    static minimal(): EventBuilder {
        return new EventBuilder()
            .withTitle("Minimal Event")
            .withoutDescription()
            .withoutImage();
    }

    /**
     * Preset: Invalid event (empty title)
     */
    static invalid(): EventBuilder {
        return new EventBuilder()
            .withTitle("")
            .withPrice(-10)
            .withTotalSeats(0);
    }

    /**
     * Preset: XSS attack data
     */
    static xssAttack(): EventBuilder {
        return new EventBuilder()
            .withTitle("<script>alert('XSS')</script>")
            .withDescription("<img src=x onerror='alert(1)'>")
            .withVenue("<script>console.log('XSS')</script>");
    }

    /**
     * Preset: SQL injection data
     */
    static sqlInjection(): EventBuilder {
        return new EventBuilder()
            .withTitle("'; DROP TABLE events; --")
            .withDescription("' OR '1'='1")
            .withVenue("' UNION SELECT * FROM users --");
    }

    /**
     * Preset: Boundary - Very expensive
     */
    static veryExpensive(): EventBuilder {
        return new EventBuilder()
            .withTitle("Luxury Gala")
            .withPrice(99999)
            .withTotalSeats(10);
    }

    /**
     * Preset: Boundary - Large capacity
     */
    static largeCapacity(): EventBuilder {
        return new EventBuilder()
            .withTitle("Stadium Event")
            .withTotalSeats(100000)
            .withPrice(25);
    }

    /**
     * Preset: Long data (boundary testing)
     */
    static withLongData(): EventBuilder {
        return new EventBuilder()
            .withTitle("A".repeat(500))
            .withDescription("B".repeat(5000))
            .withVenue("C".repeat(500));
    }

    /**
     * Preset: Special characters
     */
    static withSpecialCharacters(): EventBuilder {
        return new EventBuilder()
            .withTitle("Test Event™ © ® ∑∫∂")
            .withDescription("Event with émojis 🎉🎊🎈")
            .withVenue("Café München Zürich");
    }

    /**
     * Preset: Past date (invalid)
     */
    static withPastDate(): EventBuilder {
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 30);
        return new EventBuilder()
            .withTitle("Past Event")
            .withDateTime(pastDate.toISOString().slice(0, 16));
    }
}

/**
 * Export default
 */
export default EventBuilder;
