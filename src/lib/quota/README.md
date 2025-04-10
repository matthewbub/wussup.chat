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
import { auth } from "@clerk/nextjs/server";

// Initialize with Supabase client
const quotaManager = new QuotaManager(supabaseClient);

// Get user and check quota
const { userId } = await auth();

if (!("error" in userId)) {
  const quotaCheck = await quotaManager.checkQuota(userId);
  if (quotaCheck.hasQuota) {
    // Process message
    await quotaManager.incrementUsage(userId);
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
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Will return 429 if quota exceeded
  const quotaError = await checkQuotaMiddleware(userId, quotaManager);
  if (quotaError) return quotaError;

  // Continue with request processing...
}
```

### Subscription Management

```typescript
import { auth } from "@clerk/nextjs/server";

const { userId } = await auth();

// Upgrade user to pro tier
await quotaManager.upgradeSubscription(userId, "pro");

// Get current quota status
const status = await quotaManager.getUserQuota(userId);
console.log(status);
// {
//   currentMonthUsage: 50,
//   currentDayUsage: 5,
//   lastDayReset: "2024-03-26T00:00:00.000Z",
//   lastMonthReset: "2024-03-01T00:00:00.000Z",
//   subscriptionTier: "pro"
// }
```
