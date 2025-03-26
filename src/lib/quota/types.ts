export type SubscriptionTier = "free" | "pro";

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
  subscriptionTier: SubscriptionTier;
}
