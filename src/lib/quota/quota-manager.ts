import { SupabaseClient } from "@supabase/supabase-js";
import { SubscriptionTier, QuotaLimit, UserQuota } from "./types";

export class QuotaManager {
  private static readonly QUOTA_LIMITS: Record<SubscriptionTier, QuotaLimit> = {
    free: {
      monthlyLimit: 100,
      dailyLimit: 20,
      name: "free",
    },
    pro: {
      monthlyLimit: 1500,
      dailyLimit: null, // No daily limit for pro
      name: "pro",
    },
  };

  constructor(private supabase: SupabaseClient) {}

  private shouldResetDaily(lastResetDate: Date): boolean {
    const now = new Date();
    const lastReset = new Date(lastResetDate);
    return (
      lastReset.getDate() !== now.getDate() ||
      lastReset.getMonth() !== now.getMonth() ||
      lastReset.getFullYear() !== now.getFullYear()
    );
  }

  private shouldResetMonthly(lastResetDate: Date): boolean {
    const now = new Date();
    const lastReset = new Date(lastResetDate);
    return lastReset.getMonth() !== now.getMonth() || lastReset.getFullYear() !== now.getFullYear();
  }

  async getUserQuota(userId: string): Promise<UserQuota | null> {
    try {
      const { data, error } = await this.supabase
        .from("UserMetaData")
        .select(
          `
          current_month_usage,
          current_day_usage,
          last_day_reset,
          last_month_reset,
          subscription_tier
        `
        )
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching user quota:", error);
        return null;
      }

      // If the quota fields don't exist yet, initialize them
      if (data.current_month_usage === null || data.current_day_usage === null) {
        const now = new Date().toISOString();
        const { error: updateError } = await this.supabase
          .from("UserMetaData")
          .update({
            current_month_usage: 0,
            current_day_usage: 0,
            last_day_reset: now,
            last_month_reset: now,
            subscription_tier: "free",
          })
          .eq("id", userId);

        if (updateError) {
          console.error("Error initializing user quota:", updateError);
          return null;
        }

        return {
          currentMonthUsage: 0,
          currentDayUsage: 0,
          lastDayReset: new Date(now),
          lastMonthReset: new Date(now),
          subscriptionTier: "free",
        };
      }

      return {
        currentMonthUsage: data.current_month_usage || 0,
        currentDayUsage: data.current_day_usage || 0,
        lastDayReset: new Date(data.last_day_reset),
        lastMonthReset: new Date(data.last_month_reset),
        subscriptionTier: data.subscription_tier || "free",
      };
    } catch (error) {
      console.error("Unexpected error in getUserQuota:", error);
      return null;
    }
  }

  async checkQuota(userId: string): Promise<{
    hasQuota: boolean;
    remainingDailyQuota: number | null;
    remainingMonthlyQuota: number;
    dailyLimitExceeded: boolean;
    monthlyLimitExceeded: boolean;
    error?: string;
  }> {
    try {
      const quota = await this.getUserQuota(userId);
      if (!quota) {
        return {
          hasQuota: false,
          remainingDailyQuota: null,
          remainingMonthlyQuota: 0,
          dailyLimitExceeded: false,
          monthlyLimitExceeded: false,
          error: "Could not fetch quota",
        };
      }

      // Handle resets
      if (this.shouldResetDaily(quota.lastDayReset)) {
        await this.resetDailyQuota(userId);
        quota.currentDayUsage = 0;
      }

      if (this.shouldResetMonthly(quota.lastMonthReset)) {
        await this.resetMonthlyQuota(userId);
        quota.currentMonthUsage = 0;
      }

      const limits = QuotaManager.QUOTA_LIMITS[quota.subscriptionTier];
      const remainingMonthly = limits.monthlyLimit - quota.currentMonthUsage;
      const remainingDaily = limits.dailyLimit ? limits.dailyLimit - quota.currentDayUsage : null;

      const dailyLimitExceeded = limits.dailyLimit !== null && remainingDaily !== null && remainingDaily <= 0;
      const monthlyLimitExceeded = remainingMonthly <= 0;

      return {
        hasQuota: !dailyLimitExceeded && !monthlyLimitExceeded,
        remainingDailyQuota: remainingDaily,
        remainingMonthlyQuota: remainingMonthly,
        dailyLimitExceeded,
        monthlyLimitExceeded,
      };
    } catch (error) {
      console.error("Unexpected error in checkQuota:", error);
      return {
        hasQuota: false,
        remainingDailyQuota: null,
        remainingMonthlyQuota: 0,
        dailyLimitExceeded: false,
        monthlyLimitExceeded: false,
        error: "Unexpected error checking quota",
      };
    }
  }

  async incrementUsage(userId: string): Promise<boolean> {
    try {
      // First get current values
      const { data: currentData, error: fetchError } = await this.supabase
        .from("UserMetaData")
        .select("current_month_usage, current_day_usage")
        .eq("id", userId)
        .single();

      if (fetchError) {
        console.error("Error fetching current usage:", fetchError);
        return false;
      }

      // Then update with incremented values
      const { error: updateError } = await this.supabase
        .from("UserMetaData")
        .update({
          current_month_usage: (currentData.current_month_usage || 0) + 1,
          current_day_usage: (currentData.current_day_usage || 0) + 1,
        })
        .eq("id", userId);

      if (updateError) {
        console.error("Error incrementing usage:", updateError);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Unexpected error in incrementUsage:", error);
      return false;
    }
  }

  private async resetDailyQuota(userId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from("UserMetaData")
        .update({
          current_day_usage: 0,
          last_day_reset: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) {
        console.error("Error resetting daily quota:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Unexpected error in resetDailyQuota:", error);
      return false;
    }
  }

  private async resetMonthlyQuota(userId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from("UserMetaData")
        .update({
          current_month_usage: 0,
          last_month_reset: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) {
        console.error("Error resetting monthly quota:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Unexpected error in resetMonthlyQuota:", error);
      return false;
    }
  }

  async upgradeSubscription(userId: string, newTier: SubscriptionTier): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from("UserMetaData")
        .update({
          subscription_tier: newTier,
        })
        .eq("id", userId);

      if (error) {
        console.error("Error upgrading subscription:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Unexpected error in upgradeSubscription:", error);
      return false;
    }
  }
}
