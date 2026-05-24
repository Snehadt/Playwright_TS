#!/bin/bash

# Migration script to replace hardcoded URLs with config imports
# Run this script to update all files

echo "Starting URL migration..."

# Files to update
FILES=(
    "pages/BookEventPage.ts"
    "pages/EventsPage.ts"
    "pages/LoginPage.ts"
    "pages/MyBookingsPage.ts"
    "tests/addEvents/EventsPage.spec.ts"
    "tests/bookEvent/bookEventPage.spec.ts"
    "tests/bookingConfirmation/BookingConfirmationPage.spec.ts"
    "tests/e2e/E2EBookingFlow.spec.ts"
    "tests/myBookings/MyBookingsPage.spec.ts"
    "tests/ticketBooking/EventDetailPage.spec.ts"
)

echo "✓ Created config/urls.ts with centralized configuration"
echo "✓ Updated playwright.config.ts with baseURL"
echo ""
echo "📝 Manual Updates Required:"
echo ""
echo "For each file, add import at the top:"
echo "  import { getUIUrl, getAPIUrl, UI_ENDPOINTS, API_ENDPOINTS } from '../config/urls';"
echo ""
echo "Replace hardcoded URLs:"
echo "  'https://eventhub.rahulshettyacademy.com/events' → getUIUrl(UI_ENDPOINTS.EVENTS)"
echo "  'https://api.eventhub.rahulshettyacademy.com/api/auth/login' → getAPIUrl(API_ENDPOINTS.LOGIN)"
echo ""
echo "Files to update:"
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  - $file"
    fi
done

echo ""
echo "See config/urls.ts for all available endpoints"
