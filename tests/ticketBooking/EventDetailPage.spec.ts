import { test, expect, request } from "../../fixtures/pageFixtures.js";
import { logger } from "../../utils/Logger.js";
import { BookingDetails } from "../../pages/EventDetailPage.js";
import { BookingBuilder } from "../../utils/builders/BookingBuilder.js";
import { ConfigManager } from "../../config/ConfigManager.js";

const EVENT_ID = 1; // World Tech Summit

test.describe("Ticket Booking - Functional Tests", () => {

    test.beforeEach(async ({ authenticatedPage, eventDetailPage }) => {
        await eventDetailPage.navigateToEventDetail(EVENT_ID);
        await eventDetailPage.waitForPageLoad();
    });

    test("should verify page content and book tickets with price validation @smoke @booking @critical", async ({
        authenticatedPage,
        eventDetailPage
    }) => {
        const eventInfo = await eventDetailPage.getEventInfo();
        console.log(`Event: ${eventInfo.title}`);
        console.log(`Price per ticket: ${eventInfo.pricePerTicket}`);

        expect(eventInfo.title).toBeTruthy();
        expect(eventInfo.pricePerTicket).toBeGreaterThan(0);

        const initialQuantity = await eventDetailPage.getCurrentTicketQuantity();
        console.log(`Initial quantity: ${initialQuantity}`);

        await eventDetailPage.setTicketQuantity(2);
        await authenticatedPage.waitForTimeout(500);

        const newQuantity = await eventDetailPage.getCurrentTicketQuantity();
        expect(newQuantity).toBe(2);

        const totalPrice = await eventDetailPage.getTotalPrice();
        const expectedTotal = 2 * eventInfo.pricePerTicket;
        console.log(`Total price: ${totalPrice}, Expected: ${expectedTotal}`);

        expect(totalPrice).toBe(expectedTotal);

        await eventDetailPage.increaseTicketQuantity(1);
        await authenticatedPage.waitForTimeout(500);

        const updatedQuantity = await eventDetailPage.getCurrentTicketQuantity();
        expect(updatedQuantity).toBe(3);

        const updatedTotal = await eventDetailPage.getTotalPrice();
        const expectedUpdatedTotal = 3 * eventInfo.pricePerTicket;
        console.log(`Updated total: ${updatedTotal}, Expected: ${expectedUpdatedTotal}`);

        expect(updatedTotal).toBe(expectedUpdatedTotal);

        // Using Builder Pattern (new approach)
        const bookingDetails = new BookingBuilder()
            .withTickets(2)
            .withRandomData()
            .build();

        console.log(`Booking with: ${bookingDetails.fullName}, ${bookingDetails.email}, ${bookingDetails.phoneNumber}`);

        await eventDetailPage.fillBookingForm(bookingDetails);

        const isPriceValid = await eventDetailPage.verifyTotalPrice(2, eventInfo.pricePerTicket);
        expect(isPriceValid).toBeTruthy();

        await eventDetailPage.clickConfirmBooking();
        await authenticatedPage.waitForTimeout(2000);

        logger.step("✓ Booking completed successfully");
    });

});

test.describe("Ticket Booking - Performance Tests", () => {

    test("should complete booking within performance budget @performance @non-functional", async ({
        authenticatedPage,
        eventDetailPage
    }) => {

        const startTime = Date.now();

        await eventDetailPage.navigateToEventDetail(EVENT_ID);
        await eventDetailPage.waitForPageLoad();

        const bookingDetails = new BookingBuilder()
            .withTickets(2)
            .withRandomData()
            .build();

        await eventDetailPage.completeBooking(bookingDetails);

        const totalTime = Date.now() - startTime;

        // Performance SLA: Complete booking within 15 seconds
        expect(totalTime).toBeLessThan(15000);
        logger.step(`✓ Booking completed in ${totalTime}ms (under 15s budget)`);
    });

});

test.describe("Ticket Booking - Security Tests", () => {

    test("should prevent XSS in booking form @security @xss @owasp", async ({
        authenticatedPage,
        eventDetailPage
    }) => {

        await eventDetailPage.navigateToEventDetail(EVENT_ID);
        await eventDetailPage.waitForPageLoad();

        // Using Builder Pattern with XSS preset
        const xssBookingDetails = BookingBuilder.xssAttack().build();

        await eventDetailPage.fillBookingForm(xssBookingDetails);

        const nameValue = await eventDetailPage.fullNameInput.inputValue();
        const emailValue = await eventDetailPage.emailInput.inputValue();
        const phoneValue = await eventDetailPage.phoneInput.inputValue();

        console.log(`Name field value: ${nameValue}`);
        console.log(`Email field value: ${emailValue}`);
        console.log(`Phone field value: ${phoneValue}`);

        await eventDetailPage.clickConfirmBooking();
        await authenticatedPage.waitForTimeout(1000);

        const hasScriptInDOM = await authenticatedPage.evaluate(() => {
            return document.body.innerHTML.includes('<script>alert');
        });

        expect(hasScriptInDOM).toBeFalsy();
        console.log("✓ XSS prevented");
    });

});

test.describe("Ticket Booking - API Tests", () => {

    test("should retrieve event details via API @api @integration", async () => {
        const { request } = await import("@playwright/test");
        const { ConfigManager } = await import("../../config/ConfigManager.js");
        const config = ConfigManager.getInstance();
        const { email, password } = config.getCredentials();
        const apiContext = await request.newContext();

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

        const eventResponse = await apiContext.get(
            config.getApiUrl(`/api/events/${EVENT_ID}`),
            {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        console.log(`API Status: ${eventResponse.status()}`);

        if (eventResponse.ok()) {
            const eventData = await eventResponse.json();
            logger.step("✓ Event details retrieved via API");

            expect(eventData).toBeTruthy();
            const event = eventData.data || eventData;
            expect(event.price || event.Price).toBeTruthy();
        }

        await apiContext.dispose();
    });

});
