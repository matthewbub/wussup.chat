# QuotaManager Documentation

The QuotaManager is a utility class that handles user quota management for the chat application. It implements both monthly and daily message limits based on subscription tiers.

## Quota Limits

### Free Tier

- Monthly limit: 100 messages
- Daily limit: 20 messages

### Pro Tier

- Monthly limit: 1500 messages
- Daily limit: No limit

## Usage Examples

### Basic Usage

```typescript
import { QuotaManager } from "./quota-manager";
import { getUser, supabaseFacade } from "@/lib/server-utils";

// Initialize with Supabase client
const quotaManager = new QuotaManager(supabaseClient);

// Get user and check quota
const user = await getUser(req);
const userData = await supabaseFacade.getOrMakeUser(user);

if (!("error" in userData)) {
  const quotaCheck = await quotaManager.checkQuota(userData.id);
  if (quotaCheck.hasQuota) {
    // Process message
    await quotaManager.incrementUsage(userData.id);
  } else {
    if (quotaCheck.dailyLimitExceeded) {
      console.log("Daily limit exceeded. Try again tomorrow.");
    }
    if (quotaCheck.monthlyLimitExceeded) {
      console.log("Monthly limit exceeded. Consider upgrading.");
    }
  }
}
```

### Middleware Usage

```typescript
import { checkQuotaMiddleware } from "./middleware";

export async function POST(req: Request) {
  const user = await getUser(req);
  const userData = await supabaseFacade.getOrMakeUser(user);

  if ("error" in userData) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Will return 429 if quota exceeded
  const quotaError = await checkQuotaMiddleware(userData.id, quotaManager);
  if (quotaError) return quotaError;

  // Continue with request processing...
}
```

### Subscription Management

```typescript
// Upgrade user to pro tier
await quotaManager.upgradeSubscription(userData.id, "pro");

// Get current quota status
const status = await quotaManager.getUserQuota(userData.id);
console.log(status);
// {
//   currentMonthUsage: 50,
//   currentDayUsage: 5,
//   lastDayReset: "2024-03-26T00:00:00.000Z",
//   lastMonthReset: "2024-03-01T00:00:00.000Z",
//   subscriptionTier: "pro"
// }
```

## Error Handling

The QuotaManager provides detailed error information:

```typescript
const quotaCheck = await quotaManager.checkQuota(userData.id);
if (!quotaCheck.hasQuota) {
  if (quotaCheck.dailyLimitExceeded) {
    console.log("Daily limit exceeded. Try again tomorrow.");
  }
  if (quotaCheck.monthlyLimitExceeded) {
    console.log("Monthly limit exceeded. Consider upgrading.");
  }
}
```

## Database Schema

The QuotaManager expects the following schema in Supabase:

```sql
CREATE TYPE subscription_tier AS ENUM ('free', 'pro');

ALTER TABLE public."UserMetaData"
ADD COLUMN subscription_tier subscription_tier NOT NULL DEFAULT 'free',
ADD COLUMN current_month_usage integer NOT NULL DEFAULT 0,
ADD COLUMN current_day_usage integer NOT NULL DEFAULT 0,
ADD COLUMN last_day_reset timestamp with time zone NOT NULL DEFAULT now(),
ADD COLUMN last_month_reset timestamp with time zone NOT NULL DEFAULT now();
```
