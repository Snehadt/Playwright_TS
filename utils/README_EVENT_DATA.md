# Dynamic Event Data Generator

## Overview

The event data generator automatically creates events with **future dates** to prevent test failures due to past dates.

## Migration from eventData.json

**Old way (hardcoded dates):**
```typescript
import eventData from "../../testData/eventData.json";
```

**New way (dynamic dates):**
```typescript
import eventData from "../../utils/eventDataGenerator";
```

The usage remains **exactly the same**, but dates are now dynamically generated:

```typescript
const event = {
    ...eventData.validEvent
};
```

## Available Events

All events have dynamic future dates:

- **validEvent** - 30 days from now at 9:00 AM
- **eventWithoutDescription** - 45 days from now at 1:00 PM
- **workshopEvent** - 60 days from now at 2:00 PM
- **freeEvent** - 75 days from now at 6:00 PM
- **eventWithFreeSeat** - 90 days from now at 1:00 AM
- **sqlInjection** - 100 days from now (for security testing)
- **xssPayload** - 110 days from now (for XSS testing)
- **specialCharacters** - 120 days from now (for encoding testing)

## Custom Events

Generate custom events with specific dates:

```typescript
import { generateCustomEvent } from "../../utils/eventDataGenerator";

// Event 30 days from now
const event = generateCustomEvent(30, {
    title: "My Custom Event",
    price: 500
});

// Event 60 days from now at specific time
const futureEvent = generateCustomEvent(60, {
    title: "Future Conference",
    category: "Technology",
    city: "San Francisco"
});
```

## Benefits

✅ **No manual date updates** - Dates always in the future
✅ **Zero code changes** - Drop-in replacement for JSON import
✅ **Consistent format** - YYYY-MM-DDTHH:mm format preserved
✅ **Test reliability** - No failures due to past dates
✅ **Flexible** - Easy to customize date offsets

## Date Format

All dates generated in format: `YYYY-MM-DDTHH:mm`

Example: `2026-06-20T10:00`

## Example Usage in Tests

```typescript
test("should create event with dynamic date", async () => {
    const event: EventFormData = {
        ...eventData.validEvent
    };
    
    await eventsPage.createNewEvent(event);
    
    // dateTime is automatically 30 days in the future!
    console.log(`Event date: ${event.dateTime}`);
});
```

## Backward Compatibility

All existing tests using `eventData.json` will work after changing the import:

```diff
- import eventData from "../../testData/eventData.json";
+ import eventData from "../../utils/eventDataGenerator";
```

No other code changes required!
