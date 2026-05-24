/**
 * Event Data Generator
 * Generates event data with dynamic future dates
 */

/**
 * Generate a future date
 * @param daysFromNow - Number of days in the future
 * @param hour - Hour of the day (0-23)
 * @param minute - Minute (0-59)
 * @returns ISO datetime string in format YYYY-MM-DDTHH:mm
 */
function generateFutureDate(daysFromNow: number, hour: number = 10, minute: number = 0): string {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    date.setHours(hour, minute, 0, 0);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hourStr = String(hour).padStart(2, '0');
    const minuteStr = String(minute).padStart(2, '0');

    return `${year}-${month}-${day}T${hourStr}:${minuteStr}`;
}

/**
 * Generate event data with dynamic dates
 * All dates are guaranteed to be in the future
 */
export const eventData = {
    validEvent: {
        title: "Tech Conference 2026",
        description: "Annual technology conference featuring industry leaders and workshops",
        category: "Conference",
        city: "San Francisco",
        venue: "Moscone Center",
        dateTime: generateFutureDate(30, 9, 0), // 30 days from now, 9:00 AM
        price: 299,
        totalSeat: 500,
        imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87"
    },

    eventWithoutDescription: {
        title: "Networking Meetup",
        category: "Workshop",
        city: "New York",
        venue: "Empire State Building",
        dateTime: generateFutureDate(45, 13, 0), // 45 days from now, 1:00 PM
        price: 0,
        totalSeat: 100
    },

    workshopEvent: {
        title: "AI Workshop",
        description: "Hands-on workshop covering sports analytics",
        category: "Sports",
        city: "Boston",
        venue: "MIT Campus",
        dateTime: generateFutureDate(60, 14, 0), // 60 days from now, 2:00 PM
        price: 150,
        totalSeat: 50,
        imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995"
    },

    freeEvent: {
        title: "Community Gathering",
        description: "Free community event",
        category: "Festival",
        city: "Seattle",
        venue: "Community Center",
        dateTime: generateFutureDate(75, 18, 0), // 75 days from now, 6:00 PM
        price: 0,
        totalSeat: 200
    },

    eventWithFreeSeat: {
        title: "Music Festival 2026 Free event",
        description: "Annual music festival featuring top artists",
        category: "Concert",
        city: "Austin",
        venue: "Zilker Park",
        dateTime: generateFutureDate(90, 1, 0), // 90 days from now, 1:00 AM
        price: 199,
        totalSeat: 1000,
        imageUrl: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea"
    },

    sqlInjection: {
        title: "'; DROP TABLE events--",
        description: "Free community event",
        category: "Conference",
        city: "'; DROP TABLE events--",
        venue: "<script>alert('XSS')</script>",
        dateTime: generateFutureDate(100, 10, 0), // 100 days from now
        price: 50,
        totalSeat: 100
    },

    xssPayload: {
        title: "<script>alert('XSS')</script>",
        description: "<img src=x onerror=alert('XSS')>",
        category: "Conference",
        city: "Test City",
        venue: "Test Venue",
        dateTime: generateFutureDate(110, 10, 0), // 110 days from now
        price: 100,
        totalSeat: 50
    },

    specialCharacters: {
        title: "Test Event with Special Chars !@#$%",
        description: "Testing special characters: ñ, é, ü, 中文",
        category: "Conference",
        city: "International City",
        venue: "Test Venue",
        dateTime: generateFutureDate(120, 15, 30), // 120 days from now, 3:30 PM
        price: 75,
        totalSeat: 150
    }
};

/**
 * Get event data by key
 * @param eventKey - Key of the event data
 * @returns Event data object
 */
export function getEventData(eventKey: keyof typeof eventData) {
    return eventData[eventKey];
}

/**
 * Generate custom event with future date
 * @param baseDaysFromNow - Base number of days from now
 * @param customData - Custom event data to override
 * @returns Event data with dynamic date
 */
export function generateCustomEvent(baseDaysFromNow: number = 30, customData: Partial<any> = {}) {
    return {
        title: `Generated Event ${Date.now()}`,
        description: "Dynamically generated event for testing",
        category: "Conference",
        city: "Test City",
        venue: "Test Venue",
        dateTime: generateFutureDate(baseDaysFromNow, 10, 0),
        price: 100,
        totalSeat: 200,
        ...customData
    };
}

/**
 * Export default for backward compatibility with existing imports
 */
export default eventData;
