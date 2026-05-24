import { Locator, Page } from "@playwright/test";
import { BasePage } from "./BasePage";
import { getUIUrl, UI_ENDPOINTS } from "../config/urls";

// Type definition for event form data
export interface EventFormData {
    title: string;
    description?: string;  // Optional field
    category: string;
    city: string;
    venue: string;
    dateTime: string;
    price: number;
    totalSeat: number;
    imageUrl?: string;  // Optional field
}

export class EventsPage extends BasePage {
    readonly eventBtn: Locator;
    readonly addEventBtn: Locator;
    readonly eventTitleInput: Locator;
    readonly eventDescriptionInput: Locator;
    readonly eventCategoryInput: Locator;
    readonly eventCityInput: Locator;
    readonly eventVenueInput: Locator;
    readonly eventDateTimeInput: Locator;
    readonly eventPriceInput: Locator;
    readonly eventTotalSeatInput: Locator;
    readonly eventImageUrlInput: Locator;
    readonly submitEventBtn: Locator;
       readonly eventTable: Locator;
        eventTitles: string = ""; 
       
    constructor(page: Page) {
        super(page);
        this.eventBtn = page.locator("#nav-events");
        this.addEventBtn = page.locator("button:has-text('Add new Event')");
        this.eventTitleInput = page.locator("#event-title-input");
        this.eventDescriptionInput = page.getByPlaceholder("Describe the event…");
        this.eventCategoryInput = page.locator("#category");
        this.eventCityInput = page.locator("#city");
        this.eventVenueInput = page.locator("#venue");
        this.eventDateTimeInput = page.getByRole('textbox', { name: /Event Date & Time/i });
        this.eventPriceInput = page.getByRole('spinbutton',{name :/Price ($)*/i});
        this.eventTotalSeatInput = page.getByRole('spinbutton',{name : /Total Seats*/i});
        this.eventImageUrlInput = page.getByRole('textbox', { name: /Image URL \(optional\)/i  });
        this.eventTable= this.page.locator('//table[@class="w-full text-sm"]//tbody//tr//td//span');
        this.submitEventBtn = page.getByTestId('add-event-btn');
            

    }
   

    async navigateToEventsPage(): Promise<this> {
        await this.navigateTo(getUIUrl(UI_ENDPOINTS.HOME));
        return this;
    }

    async clickEventBtn(): Promise<this> {
        await this.clickElement(this.eventBtn);
        await this.waitForUrlContains(UI_ENDPOINTS.EVENTS, 5000);
        return this;
    }

    async clickAddEvent(): Promise<this> {
        await this.clickElement(this.addEventBtn);
        await this.waitForUrlContains(UI_ENDPOINTS.ADMIN_EVENTS, 5000);
        return this;
    }

    /**
     * Fill event form with provided data
     * @param eventData - Event data with optional description and imageUrl fields
     */
    async fillEventForm(eventData: EventFormData): Promise<this> {
        await this.eventTitleInput.fill(eventData.title);
        this.eventTitles = await this.eventTitleInput.inputValue(); // Store the title for later verification

        // Handle optional description
        if (eventData.description) {
            await this.eventDescriptionInput.fill(eventData.description);
        }

        await this.eventCategoryInput.selectOption(eventData.category);
        await this.eventCityInput.fill(eventData.city);
        await this.eventVenueInput.fill(eventData.venue);
        await this.eventDateTimeInput.fill(eventData.dateTime);
        await this.eventPriceInput.fill(eventData.price.toString());
        await this.eventTotalSeatInput.fill(eventData.totalSeat.toString());

        // Handle optional imageUrl
        if (eventData.imageUrl) {
            await this.eventImageUrlInput.fill(eventData.imageUrl.toString());
        }
        return this;
    }

    async clickSubmitEvent(): Promise<this> {
        await this.submitEventBtn.click();
        return this;
    }

    /**
     * Complete flow: Navigate to events page, fill form, and submit
     * @param eventData - Event data
     */
    async createNewEvent(eventData: EventFormData): Promise<this> {
        await this.clickEventBtn();        // Go to events list
        await this.clickAddEvent();        // Click "Add new Event"
        await this.fillEventForm(eventData); // Fill the form
        await this.clickSubmitEvent();      // Submit
     //   await this.page.waitForURL("https://eventhub.rahulshettyacademy.com/events", { timeout: 5000 });
        return this;
    }


    /**
     * Verify event exists on the page by title
     */
    async isEventVisible(eventTitle : string): Promise<boolean> {
        const eventCard = this.eventTable.filter({ hasText: eventTitle }).first();
       const isVisible = await eventCard.isVisible();
        console.log(`Event with title "${eventTitle}" is visible: ${isVisible}`);
        return isVisible;
    }
}
