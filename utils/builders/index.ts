/**
 * Test Data Builders
 *
 * Export all builder classes for easy importing
 *
 * Usage:
 * ```typescript
 * import { BookingBuilder, EventBuilder } from '../../utils/builders';
 *
 * const booking = new BookingBuilder().withTickets(2).build();
 * const event = new EventBuilder().withTitle("My Event").build();
 * ```
 */

export { BookingBuilder } from './BookingBuilder';
export { EventBuilder } from './EventBuilder';

// Re-export as default for convenience
export { BookingBuilder as default } from './BookingBuilder';
