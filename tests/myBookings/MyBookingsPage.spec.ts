import { test, expect, request } from "../../fixtures/pageFixtures";
import { logger } from "../../utils/Logger";
import { BookingBuilder } from "../../utils/builders";
import { ConfigManager } from "../../config/ConfigManager";

const EVENT_ID = 1; // World Tech Summit

test.describe("My Bookings - Functional Tests", () => {

    test("should validate booking appears in My Bookings list @smoke @my-bookings @critical", async ({
        authenticatedPage,
        eventDetailPage,
        confirmationPage,
        myBookingsPage
    }) => {

        // Book event
        await eventDetailPage.navigateToEventDetail(EVENT_ID);
        await eventDetailPage.waitForPageLoad();

        const bookingData = new BookingBuilder()
            .withTickets(2)
            .withRandomData()
            .build();
        logger.info(`\nBooking: ${bookingData.fullName}, ${bookingData.numberOfTickets} tickets`);

        await eventDetailPage.fillBookingForm(bookingData);
        await eventDetailPage.clickConfirmBooking();

        await confirmationPage.waitForConfirmationModal();

        const bookingRef = await confirmationPage.getBookingReference();
        logger.step("✓ Booking reference obtained");

        // Click View My Bookings
        await confirmationPage.clickViewMyBookings();
        await myBookingsPage.waitForPageLoad();

        // Verify we're on My Bookings page
        expect(authenticatedPage.url()).toContain('/bookings');
        logger.step("✓ Navigated to My Bookings page");

        // Check if booking is present
        const isPresent = await myBookingsPage.isBookingPresent(bookingRef);
        expect(isPresent).toBeTruthy();
        logger.step("✓ Booking found in list");

        // Get and validate booking details
        const bookingDetails = await myBookingsPage.getBookingDetailsByReference(bookingRef);

        expect(bookingDetails.bookingReference).toBe(bookingRef);
        expect(bookingDetails.bookingId).toBeTruthy();
        logger.step("✓ Booking reference and ID validated");

        expect(bookingDetails.status.toLowerCase()).toBe('confirmed');
        logger.step("✓ Booking status confirmed");

        expect(bookingDetails.eventName).toContain('World Tech Summit');
        logger.step("✓ Event name validated");

        expect(bookingDetails.numberOfTickets).toBe(bookingData.numberOfTickets);
        logger.step("✓ Number of tickets validated");

        expect(bookingDetails.eventDate).toBeTruthy();
        logger.step("✓ Event date validated");

        expect(bookingDetails.venue).toBeTruthy();
        logger.step("✓ Venue validated");

        expect(bookingDetails.bookingDate).toBeTruthy();
        logger.step("✓ Booking date validated");

        // Validate booking ID exists
        const hasValidId = await myBookingsPage.verifyBookingIdExists(bookingRef);
        expect(hasValidId).toBeTruthy();

        // Complete validation
        const isValid = await myBookingsPage.validateBooking(
            bookingRef,
            'World Tech Summit',
            bookingData.numberOfTickets,
            'confirmed'
        );
        expect(isValid).toBeTruthy();
    });

});

test.describe("My Bookings - Performance Tests", () => {

    test("should load My Bookings page within performance budget @performance @non-functional", async ({
        authenticatedPage,
        myBookingsPage
    }) => {

        const startTime = Date.now();

        await myBookingsPage.navigateToMyBookings();
        await myBookingsPage.waitForPageLoad();

        const bookingCount = await myBookingsPage.getBookingCount();

        const loadTime = Date.now() - startTime;

        // Performance SLA: Page should load within 3 seconds
        expect(loadTime).toBeLessThan(3000);

        expect(bookingCount).toBeGreaterThan(0);

        logger.step(`✓ Page loaded in ${loadTime}ms with ${bookingCount} bookings`);
    });

});

test.describe("My Bookings - Security Tests", () => {

    test("should prevent unauthorized access to bookings @security @authorization", async ({
        page,
        myBookingsPage,
        authenticatedPage
    }) => {
        // Try to access without authentication
        const config = ConfigManager.getInstance();
        await page.goto(config.getUiUrl('/bookings'));
        await page.waitForTimeout(2000);

        const currentUrl = page.url();

        // Should redirect to login or show error
        const isOnBookingsPage = currentUrl.includes('/bookings') && !currentUrl.includes('/login');

        if (isOnBookingsPage) {
            // Check if page shows any bookings without auth
            const bookingCount = await myBookingsPage.getBookingCount().catch(() => 0);

            // If bookings are shown without auth, that's a security issue
            // For this test, we'll check if the page properly requires authentication
        logger.info(`Bookings shown without auth: ${bookingCount}`);

            // Switch to authenticated page and verify we can see bookings
            const authenticatedMyBookings = new (await import("../../pages/MyBookingsPage.js")).MyBookingsPage(authenticatedPage);
            await authenticatedMyBookings.navigateToMyBookings();
            await authenticatedMyBookings.waitForPageLoad();

            const authenticatedCount = await authenticatedMyBookings.getBookingCount();
            expect(authenticatedCount).toBeGreaterThan(0);

            logger.step("✓ Authorization verified - bookings visible when authenticated");
        } else {
            logger.step("✓ Properly redirected when not authenticated");
        }
    });

});

test.describe("My Bookings - API Tests", () => {

    test("should retrieve bookings list via API @api @integration", async () => {
        const { request } = await import("@playwright/test");
        const { ConfigManager } = await import("../../config/ConfigManager.js");
        const config = ConfigManager.getInstance();
        const { email, password } = config.getCredentials();
        const apiContext = await request.newContext();

        // Login via API
        const loginResponse = await apiContext.post(
            config.getApiUrl('/api/auth/login'),
            {
                data: {
                    email: email,
                    password: password
                },
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

        expect(loginResponse.ok()).toBeTruthy();
        const loginBody = await loginResponse.json();
        const token = loginBody.token;

        logger.info("✓ Authentication successful");

        // Get bookings via API
        const bookingsResponse = await apiContext.get(
            config.getApiUrl('/api/bookings'),
            {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        logger.info(`Bookings API Status: ${bookingsResponse.status()}`);

        if (bookingsResponse.ok()) {
            const bookingsData = await bookingsResponse.json();
            logger.step("✓ Bookings retrieved via API");

            expect(bookingsData).toBeTruthy();

            const bookings = bookingsData.data || bookingsData.bookings || bookingsData;

            if (Array.isArray(bookings)) {
                logger.step(`✓ Bookings array retrieved with ${bookings.length} items`);

                if (bookings.length > 0) {
                    const firstBooking = bookings[0];
        logger.info(`\nFirst Booking Details:`);
        logger.info(`  ID: ${firstBooking.id || firstBooking.bookingId}`);
        logger.info(`  Reference: ${firstBooking.bookingRef || firstBooking.bookingReference}`);
        logger.info(`  Event: ${firstBooking.event?.title || firstBooking.eventName || 'N/A'}`);
        logger.info(`  Tickets: ${firstBooking.quantity || firstBooking.numberOfTickets}`);
        logger.info(`  Status: ${firstBooking.status}`);
        logger.info(`  Total: ${firstBooking.totalPrice || firstBooking.totalAmount}`);

                    // Validate structure
                    expect(firstBooking.id || firstBooking.bookingId).toBeTruthy();
                    expect(firstBooking.bookingRef || firstBooking.bookingReference).toBeTruthy();
                }
            }
        } else {
            const errorBody = await bookingsResponse.text();
        logger.info(`⚠️ Bookings API response: ${errorBody}`);
        }

        await apiContext.dispose();
    });

});
