/**
 * Data Generator Utility
 * Provides functions to generate random test data
 */

/**
 * Generate a random Indian phone number
 * Format: +91 XXXXXXXXXX (10 digits after +91)
 * @returns Random Indian phone number
 */
export function generateIndianPhoneNumber(): string {
    // Indian mobile numbers start with 6, 7, 8, or 9
    const firstDigit = [6, 7, 8, 9][Math.floor(Math.random() * 4)];

    // Generate remaining 9 digits
    const remainingDigits = Array.from({ length: 9 }, () =>
        Math.floor(Math.random() * 10)
    ).join('');

    return `+91 ${firstDigit}${remainingDigits}`;
}

/**
 * Generate a random US phone number
 * Format: +1 (XXX) XXX-XXXX
 * @returns Random US phone number
 */
export function generateUSPhoneNumber(): string {
    const areaCode = Math.floor(Math.random() * 900) + 100;
    const firstPart = Math.floor(Math.random() * 900) + 100;
    const secondPart = Math.floor(Math.random() * 9000) + 1000;

    return `+1 (${areaCode}) ${firstPart}-${secondPart}`;
}

/**
 * Generate a random phone number (defaults to Indian format)
 * @param country - Country code: 'IN' | 'US' (default: 'IN')
 * @returns Random phone number
 */
export function generatePhoneNumber(country: 'IN' | 'US' = 'IN'): string {
    return country === 'US' ? generateUSPhoneNumber() : generateIndianPhoneNumber();
}

/**
 * Generate a random email address
 * @param prefix - Optional prefix for email (default: 'test')
 * @returns Random email address
 */
export function generateEmail(prefix: string = 'test'): string {
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 10000);
    return `${prefix}_${timestamp}_${randomNum}@example.com`;
}

/**
 * Generate a random full name
 * @returns Random full name
 */
export function generateFullName(): string {
    const firstNames = [
        'Rahul', 'Priya', 'Amit', 'Sneha', 'Vikram', 'Anjali', 'Arjun', 'Kavya',
        'Rohan', 'Neha', 'Karan', 'Pooja', 'Aditya', 'Divya', 'Sanjay', 'Meera',
        'John', 'Sarah', 'Michael', 'Emily', 'David', 'Jessica', 'James', 'Ashley'
    ];

    const lastNames = [
        'Sharma', 'Kumar', 'Singh', 'Patel', 'Verma', 'Gupta', 'Reddy', 'Iyer',
        'Mehta', 'Nair', 'Rao', 'Desai', 'Joshi', 'Malhotra', 'Kapoor', 'Khan',
        'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'
    ];

    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

    return `${firstName} ${lastName}`;
}

/**
 * Generate random booking details
 * @param numberOfTickets - Number of tickets (default: random between 1-5)
 * @returns Object with random booking details
 *
 * @deprecated Use BookingBuilder instead for more flexibility:
 * ```typescript
 * import { BookingBuilder } from './builders';
 * const booking = new BookingBuilder().withTickets(2).build();
 * ```
 *
 * This function is maintained for backward compatibility.
 */
export function generateBookingDetails(numberOfTickets?: number) {
    // Now uses BookingBuilder internally for consistency
    const { BookingBuilder } = require('./builders/BookingBuilder');
    return new BookingBuilder()
        .withTickets(numberOfTickets || Math.floor(Math.random() * 5) + 1)
        .withRandomData()
        .build();
}

/**
 * Generate a random number within a range
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @returns Random number
 */
export function generateRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate a random string of specified length
 * @param length - Length of string
 * @param includeNumbers - Include numbers (default: true)
 * @returns Random string
 */
export function generateRandomString(length: number, includeNumbers: boolean = true): string {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const chars = includeNumbers ? letters + numbers : letters;

    return Array.from({ length }, () =>
        chars.charAt(Math.floor(Math.random() * chars.length))
    ).join('');
}
