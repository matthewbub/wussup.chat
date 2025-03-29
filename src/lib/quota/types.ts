export type SubscriptionTier = "free" | "Pro (Alpha, 1 Month)" | "Pro (Alpha, 3 Months)" | "Pro (Alpha, 12 Months)";

export interface QuotaLimit {
  monthlyLimit: number;
  dailyLimit: number | null; // null means no limit
  name: SubscriptionTier;
}

export interface UserQuota {
  currentMonthUsage: number;
  currentDayUsage: number;
  lastDayReset: Date;
  lastMonthReset: Date;
  planName: SubscriptionTier;
}
