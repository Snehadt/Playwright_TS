import { test, expect, request } from "../../fixtures/pageFixtures";
import { BookingBuilder } from "../../utils/builders";
import { getAPIUrl, API_ENDPOINTS } from "../../config/urls";
import { ConfigManager } from "../../config/ConfigManager";
import { logger } from "../../utils/Logger";
import { TestContext } from "../../utils/TestContext";

const EVENT_ID = 1;
const EVENT_NAME = "World Tech Summit";

/**
 * E2E Booking Flow Tests
 * Uses custom fixtures for automatic page object injection and authentication
 */

test.describe("E2E Booking Flow - UI Journey", () => {

    test("should complete full booking journey via UI @e2e @ui @critical", async ({
        page,
        loginPage,
        bookEventPage,
        eventDetailPage,
        confirmationPage,
        myBookingsPage
    }) => {
        // Initialize test context
        const ctx = new TestContext();
        ctx.startTest("E2E UI Booking Journey", ["e2e", "ui", "critical"]);

        logger.testStart("E2E UI Booking Journey", { tags: ["e2e", "ui", "critical"] });

        // Step 1: Login via UI
        const config = ConfigManager.getInstance();
        const { email, password } = config.getCredentials();

        await loginPage.navigateToLoginPage();
        await loginPage.login(email, password);
        await page.waitForURL(config.getUiBaseUrl() + '/', { timeout: 10000 });
        logger.step("✓ Step 1: Logged in via UI");

        // Step 2: Navigate to events page
        await bookEventPage.navigateToEventsPage();
        await bookEventPage.waitForEventsToLoad();

        const allEvents = await bookEventPage.getAllEventTitles();
        expect(allEvents.length).toBeGreaterThan(0);
        logger.step(`✓ Step 2: Events page loaded (${allEvents.length} events)`);

        // Step 3: Navigate to event detail page
        ctx.setEventId(EVENT_ID);
        ctx.setEventName(EVENT_NAME);

        await eventDetailPage.navigateToEventDetail(EVENT_ID);
        await eventDetailPage.waitForPageLoad();

        const eventInfo = await eventDetailPage.getEventInfo();
        expect(eventInfo.title).toContain(EVENT_NAME);
        ctx.event.pricePerTicket = eventInfo.pricePerTicket;
        logger.step(`✓ Step 3: Navigated to ${ctx.getEventName()}`);

        // Step 4: Fill booking form
        const bookingData = new BookingBuilder()
            .withTickets(2)
            .withRandomData()
            .build();
        ctx.setBookingData(bookingData);

        await eventDetailPage.fillBookingForm(bookingData);
        logger.step(`✓ Step 4: Booking form filled (${ctx.booking.numberOfTickets} tickets)`);

        // Step 5: Confirm booking
        await eventDetailPage.clickConfirmBooking();

        await confirmationPage.waitForConfirmationModal();

        const bookingRef = await confirmationPage.getBookingReference();
        expect(bookingRef).toBeTruthy();
        ctx.setBookingReference(bookingRef);
        logger.step(`✓ Step 5: Booking confirmed (${ctx.getBookingReference()})`);

        // Step 6: Navigate to My Bookings
        await confirmationPage.clickViewMyBookings();
        await myBookingsPage.waitForPageLoad();

        const isPresent = await myBookingsPage.isBookingPresent(ctx.getBookingReference());
        expect(isPresent).toBeTruthy();
        logger.step(`✓ Step 6: Booking found in My Bookings`);

        // Step 7: Validate booking details
        const isValid = await myBookingsPage.validateBooking(
            ctx.getBookingReference(),
            ctx.getEventName(),
            ctx.booking.numberOfTickets!
        );
        expect(isValid).toBeTruthy();
        logger.step(`✓ Step 7: Booking details validated`);

        // Step 8: Clear all bookings (if button exists)
        const clearAllBtn = page.locator('button:has-text("Clear All"), button:has-text("Delete All")');
        const hasClearBtn = await clearAllBtn.count();

        if (hasClearBtn > 0) {
            await clearAllBtn.first().click();
            await page.waitForTimeout(2000);
            logger.step(`✓ Step 8: Clear all bookings clicked`);
        } else {
            logger.step(`⚠ Step 8: Clear all button not found`);
        }

        // Step 9: Logout
        const logoutBtn = page.locator('button:has-text("Logout"), a:has-text("Logout")');
        await logoutBtn.waitFor({ timeout: 5000 });
        await logoutBtn.click();
        await page.waitForTimeout(2000);

        const currentUrl = page.url();
        expect(currentUrl).toMatch(/login|home|\/$|eventhub/);
        logger.step(`✓ Step 9: Logged out successfully`);

        ctx.endTest();
        logger.info("🎉 E2E UI Journey Completed Successfully!");
        logger.info(`Test Duration: ${ctx.getTestDuration()}ms`);
        logger.info(`Context Summary: ${ctx.getSummary()}`);
        logger.testPass("E2E UI Booking Journey");
    });

});

test.describe("E2E Booking Flow - API Journey", () => {

    test("should complete full booking journey via API @e2e @api @critical", async () => {
        // Initialize test context
        const ctx = new TestContext();
        ctx.startTest("E2E API Booking Journey", ["e2e", "api", "critical"]);

        logger.testStart("E2E API Booking Journey", { tags: ["e2e", "api", "critical"] });
        const config = ConfigManager.getInstance();
        const { email, password } = config.getCredentials();
        const apiContext = await request.newContext();

        ctx.setUser(email);

        // Step 1: Login via API
        const loginResponse = await apiContext.post(
            getAPIUrl(API_ENDPOINTS.LOGIN),
            {
                data: {
                    email,
                    password
                },
                headers: { "Content-Type": "application/json" }
            }
        );

        expect(loginResponse.ok()).toBeTruthy();
        const loginBody = await loginResponse.json();
        ctx.setApiToken(loginBody.token);
        ctx.recordApiResponse(loginBody, loginResponse.status());
        logger.step("✓ Step 1: API Authentication successful");

        // Step 2: Get events list
        const eventsResponse = await apiContext.get(
            getAPIUrl(API_ENDPOINTS.EVENTS_LIST),
            { headers: { "Authorization": `Bearer ${ctx.getApiToken()}` } }
        );

        expect(eventsResponse.ok()).toBeTruthy();
        const eventsData = await eventsResponse.json();
        const events = eventsData.data || eventsData.events || eventsData;

        expect(Array.isArray(events)).toBeTruthy();
        logger.step(`✓ Step 2: Retrieved ${events.length} events`);

        // Step 3: Find World Tech Summit
        const targetEvent = events.find((e: any) =>
            e.title?.includes(EVENT_NAME)
        );

        expect(targetEvent).toBeTruthy();
        ctx.setEventId(targetEvent.id);
        ctx.setEventName(targetEvent.title);
        ctx.event.price = targetEvent.price;
        logger.step(`✓ Step 3: Found ${ctx.getEventName()} (ID: ${ctx.getEventId()})`);

        // Step 4: Create booking via API
        const bookingData = new BookingBuilder()
            .withTickets(2)
            .withRandomData()
            .build();
        ctx.setBookingData(bookingData);

        const bookingPayload = {
            eventId: ctx.getEventId(),
            quantity: bookingData.numberOfTickets,
            customerName: bookingData.fullName,
            customerEmail: bookingData.email,
            customerPhone: bookingData.phoneNumber.replace(/[^0-9+]/g, '')
        };

        ctx.recordApiRequest(bookingPayload);

        const bookingResponse = await apiContext.post(
            getAPIUrl(API_ENDPOINTS.CREATE_BOOKING),
            {
                headers: {
                    "Authorization": `Bearer ${ctx.getApiToken()}`,
                    "Content-Type": "application/json"
                },
                data: bookingPayload
            }
        );

        expect(bookingResponse.status()).toBe(201);
        const bookingResult = await bookingResponse.json();
        ctx.recordApiResponse(bookingResult, bookingResponse.status());

        const booking = bookingResult.data || bookingResult.booking || bookingResult;
        ctx.setBookingReference(booking.bookingRef);
        ctx.setBookingId(booking.id);

        expect(ctx.getBookingReference()).toBeTruthy();
        logger.step(`✓ Step 4: Booking created (${ctx.getBookingReference()})`);

        // Step 5: Get booking details
        const bookingDetailResponse = await apiContext.get(
            `${getAPIUrl(API_ENDPOINTS.CREATE_BOOKING)}/${ctx.getBookingId()}`,
            { headers: { "Authorization": `Bearer ${ctx.getApiToken()}` } }
        );

        if (bookingDetailResponse.ok()) {
            const detail = await bookingDetailResponse.json();
            logger.step(`✓ Step 5: Booking details retrieved`);
        } else {
            logger.step(`⚠ Step 5: Booking detail endpoint not available`);
        }

        // Step 6: Get my bookings list
        const myBookingsResponse = await apiContext.get(
            getAPIUrl(API_ENDPOINTS.CREATE_BOOKING),
            { headers: { "Authorization": `Bearer ${ctx.getApiToken()}` } }
        );

        expect(myBookingsResponse.ok()).toBeTruthy();
        const bookingsData = await myBookingsResponse.json();
        const bookings = bookingsData.data || bookingsData.bookings || bookingsData;

        const ourBooking = bookings.find((b: any) => b.bookingRef === ctx.getBookingReference());
        expect(ourBooking).toBeTruthy();
        logger.step(`✓ Step 6: Booking found in My Bookings list`);

        // Step 7: Validate booking details
        expect(ourBooking.customerName).toBe(ctx.getBookingData().fullName);
        expect(ourBooking.quantity).toBe(ctx.booking.numberOfTickets);
        expect(ourBooking.status).toBe('confirmed');
        ctx.booking.status = ourBooking.status;
        logger.step(`✓ Step 7: Booking details validated`);

        // Step 8: Delete booking (Clear)
        const deleteResponse = await apiContext.delete(
            `${getAPIUrl(API_ENDPOINTS.CREATE_BOOKING)}/${ctx.getBookingId()}`,
            { headers: { "Authorization": `Bearer ${ctx.getApiToken()}` } }
        );

        if (deleteResponse.ok()) {
            logger.step(`✓ Step 8: Booking deleted via API`);
        } else {
            logger.step(`⚠ Step 8: Delete endpoint returned ${deleteResponse.status()}`);
        }

        // Step 9: Cleanup
        await apiContext.dispose();
        logger.step(`Step 9: API context disposed`);

        ctx.endTest();
        logger.info("🎉 E2E API Journey Completed Successfully!");
        logger.info(`Test Duration: ${ctx.getTestDuration()}ms`);
        logger.info(`Context Summary: ${ctx.getSummary()}`);
        logger.testPass("E2E API Booking Journey");
    });

});
