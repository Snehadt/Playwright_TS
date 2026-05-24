# Test Data Directory

## ⚠️ IMPORTANT: Event Data Migration

### eventData.json - DEPRECATED ❌

**Do NOT use `eventData.json` for new tests.**

The JSON file has hardcoded dates that will become outdated. Dates are currently set to 2030 but will still need manual updates.

### Use eventDataGenerator.ts instead ✅

**Location:** `utils/eventDataGenerator.ts`

**Benefits:**
- ✅ Dates are ALWAYS in the future (calculated dynamically)
- ✅ No manual updates needed
- ✅ Same API as JSON (drop-in replacement)
- ✅ Configurable date offsets

### Migration

**Old (deprecated):**
```typescript
import eventData from "../../testData/eventData.json";
```

**New (recommended):**
```typescript
import eventData from "../../utils/eventDataGenerator";
```

**Usage remains the same:**
```typescript
const event = {
    ...eventData.validEvent
};
// dateTime is automatically 30 days in the future!
```

### Why JSON Can't Work

JSON is static data and cannot execute code to calculate dates. Even with "far future" dates (2030), they will eventually become outdated and require manual updates.

The TypeScript generator calculates dates at runtime, ensuring they're ALWAYS valid.

### Documentation

See `utils/README_EVENT_DATA.md` for complete migration guide and examples.

---

## Other Test Data Files

### loginData.json ✅
- Contains test user credentials
- No date dependencies
- Safe to use as-is

---

**Last Updated:** May 2026  
**Status:** eventData.json deprecated, use eventDataGenerator.ts
