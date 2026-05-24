import { BookingDetails } from "../../pages/EventDetailPage";
import { generateFullName, generateEmail, generatePhoneNumber } from "../dataGenerator";

/**
 * Test Data Builder for BookingDetails
 *
 * Provides a fluent API for creating test booking data with sensible defaults.
 * Implements the Builder pattern for flexible, readable test data creation.
 *
 * Usage:
 * ```typescript
 * // Simple booking with defaults
 * const booking = new BookingBuilder().build();
 *
 * // Customized booking
 * const booking = new BookingBuilder()
 *     .withTickets(2)
 *     .withName("John Doe")
 *     .withEmail("john@test.com")
 *     .build();
 *
 * // Using presets
 * const vipBooking = BookingBuilder.vipBooking().build();
 * const minimalBooking = BookingBuilder.minimal().build();
 *
 * // Random data
 * const randomBooking = new BookingBuilder()
 *     .withTickets(5)
 *     .withRandomData()
 *     .build();
 * ```
 */
export class BookingBuilder {
    private numberOfTickets: number = 1;
    private fullName: string = "Test User";
    private email: string = `test.user.${Date.now()}@qa.com`;
    private phoneNumber: string = "+1234567890";

    /**
     * Set number of tickets
     */
    withTickets(count: number): this {
        this.numberOfTickets = count;
        return this;
    }

    /**
     * Set full name
     */
    withName(name: string): this {
        this.fullName = name;
        return this;
    }

    /**
     * Set email address
     */
    withEmail(email: string): this {
        this.email = email;
        return this;
    }

    /**
     * Set phone number
     */
    withPhone(phone: string): this {
        this.phoneNumber = phone;
        return this;
    }

    /**
     * Use random generated data for name, email, and phone
     * Useful when you don't care about specific values
     */
    withRandomData(): this {
        this.fullName = generateFullName();
        this.email = generateEmail('testuser');
        this.phoneNumber = generatePhoneNumber();
        return this;
    }

    /**
     * Use random name only
     */
    withRandomName(): this {
        this.fullName = generateFullName();
        return this;
    }

    /**
     * Use random email only
     */
    withRandomEmail(): this {
        this.email = generateEmail('testuser');
        return this;
    }

    /**
     * Use random phone only
     */
    withRandomPhone(): this {
        this.phoneNumber = generatePhoneNumber();
        return this;
    }

    /**
     * Build and return the BookingDetails object
     */
    build(): BookingDetails {
        return {
            numberOfTickets: this.numberOfTickets,
            fullName: this.fullName,
            email: this.email,
            phoneNumber: this.phoneNumber
        };
    }

    // ==================== PRESET CONFIGURATIONS ====================

    /**
     * Preset: VIP booking
     * 5 tickets with VIP customer details
     */
    static vipBooking(): BookingBuilder {
        return new BookingBuilder()
            .withTickets(5)
            .withName("VIP Customer")
            .withEmail("vip.customer@company.com")
            .withPhone("+1999888777");
    }

    /**
     * Preset: Minimal valid booking
     * Single ticket with default valid data
     */
    static minimal(): BookingBuilder {
        return new BookingBuilder()
            .withTickets(1);
    }

    /**
     * Preset: Bulk booking
     * Large number of tickets
     */
    static bulk(): BookingBuilder {
        return new BookingBuilder()
            .withTickets(50)
            .withName("Corporate Event Coordinator")
            .withEmail("events@corporation.com")
            .withPhone("+1555123456");
    }

    /**
     * Preset: Random booking
     * All fields randomized
     */
    static random(): BookingBuilder {
        return new BookingBuilder()
            .withRandomData();
    }

    /**
     * Preset: Invalid booking (zero tickets)
     * For negative testing
     */
    static invalid(): BookingBuilder {
        return new BookingBuilder()
            .withTickets(0)
            .withName("")
            .withEmail("invalid-email");
    }

    /**
     * Preset: XSS attack data
     * For security testing
     */
    static xssAttack(): BookingBuilder {
        return new BookingBuilder()
            .withTickets(1)
            .withName("<script>alert('XSS')</script>")
            .withEmail("xss@test.com<script>alert('XSS')</script>")
            .withPhone("+1234567890");
    }

    /**
     * Preset: SQL injection data
     * For security testing
     */
    static sqlInjection(): BookingBuilder {
        return new BookingBuilder()
            .withTickets(1)
            .withName("'; DROP TABLE bookings; --")
            .withEmail("test@test.com")
            .withPhone("+1234567890");
    }

    /**
     * Preset: Long data (boundary testing)
     * Test with very long strings
     */
    static withLongData(): BookingBuilder {
        return new BookingBuilder()
            .withTickets(1)
            .withName("A".repeat(500))  // 500 characters
            .withEmail("a".repeat(100) + "@test.com")  // Very long email
            .withPhone("+1234567890123456789012345");  // Very long phone
    }

    /**
     * Preset: Special characters
     * For input validation testing
     */
    static withSpecialCharacters(): BookingBuilder {
        return new BookingBuilder()
            .withTickets(1)
            .withName("Test Ü∑ø§∂åß∂ƒ©˙∆˚¬")
            .withEmail("test+tag@example.com")
            .withPhone("+1 (234) 567-8900");
    }

    /**
     * Preset: Boundary - Max tickets
     */
    static maxTickets(): BookingBuilder {
        return new BookingBuilder()
            .withTickets(100);
    }

    /**
     * Preset: Boundary - Min tickets
     */
    static minTickets(): BookingBuilder {
        return new BookingBuilder()
            .withTickets(1);
    }

    /**
     * Preset: Negative tickets (invalid)
     */
    static negativeTickets(): BookingBuilder {
        return new BookingBuilder()
            .withTickets(-5);
    }
}

/**
 * Export default
 */
export default BookingBuilder;
