import { SupabaseClient } from "@supabase/supabase-js";
import { SubscriptionTier, QuotaLimit, UserQuota } from "./types";
import { TableNames } from "@/constants/tables";
import * as Sentry from "@sentry/nextjs";

export class QuotaManager {
  private static readonly QUOTA_LIMITS: Record<SubscriptionTier, QuotaLimit> = {
    free: {
      monthlyLimit: 100,
      dailyLimit: 20,
      name: "free",
    },
    "Pro (Alpha, 1 Month)": {
      monthlyLimit: 1500,
      dailyLimit: null, // No daily limit for pro
      name: "Pro (Alpha, 1 Month)",
    },
    "Pro (Alpha, 3 Months)": {
      monthlyLimit: 1500,
      dailyLimit: null, // No daily limit for pro
      name: "Pro (Alpha, 3 Months)",
    },
    "Pro (Alpha, 12 Months)": {
      monthlyLimit: 1500,
      dailyLimit: null, // No daily limit for pro
      name: "Pro (Alpha, 12 Months)",
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
        .from(TableNames.USERS)
        .select(
          `
          current_month_usage,
          current_day_usage,
          last_day_reset,
          last_month_reset,
          product_id
        `
        )
        .eq("id", userId)
        .single();

      if (error) {
        Sentry.captureException(error);
        return null;
      }

      // If the quota fields don't exist yet, initialize them
      if (data.current_month_usage === null || data.current_day_usage === null) {
        const now = new Date().toISOString();
        const { error: updateError } = await this.supabase
          .from(TableNames.USERS)
          .update({
            current_month_usage: 0,
            current_day_usage: 0,
            last_day_reset: now,
            last_month_reset: now,
            product_id: null,
          })
          .eq("id", userId);

        if (updateError) {
          Sentry.captureException(updateError);
          return null;
        }

        return {
          currentMonthUsage: 0,
          currentDayUsage: 0,
          lastDayReset: new Date(now),
          lastMonthReset: new Date(now),
          planName: "free",
        };
      }

      const planName = this.getPlanFromPriceId(data.product_id);

      return {
        currentMonthUsage: data.current_month_usage || 0,
        currentDayUsage: data.current_day_usage || 0,
        lastDayReset: new Date(data.last_day_reset),
        lastMonthReset: new Date(data.last_month_reset),
        planName,
      };
    } catch (error) {
      Sentry.captureException(error);
      return null;
    }
  }

  private getPlanFromPriceId(priceId: string | null): SubscriptionTier {
    if (!priceId) return "free";

    if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_FOR__PRO_PLAN_ALPHA_ONE_MONTH) {
      return "Pro (Alpha, 1 Month)";
    }

    if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_FOR__PRO_PLAN_ALPHA_THREE_MONTHS) {
      return "Pro (Alpha, 3 Months)";
    }

    if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_FOR__PRO_PLAN_ALPHA_TWELVE_MONTHS) {
      return "Pro (Alpha, 12 Months)";
    }

    return "free";
  }

  async checkQuota(userId: string): Promise<{
    hasQuota: boolean;
    remainingDailyQuota: number | null;
    remainingMonthlyQuota: number;
    dailyLimitExceeded: boolean;
    monthlyLimitExceeded: boolean;
    planName: SubscriptionTier;
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
          planName: "free",
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

      const limits = QuotaManager.QUOTA_LIMITS[quota.planName];
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
        planName: quota.planName,
      };
    } catch (error) {
      Sentry.captureException(error);
      return {
        hasQuota: false,
        remainingDailyQuota: null,
        remainingMonthlyQuota: 0,
        dailyLimitExceeded: false,
        monthlyLimitExceeded: false,
        planName: "free",
        error: "Unexpected error checking quota",
      };
    }
  }

  async incrementUsage(userId: string): Promise<boolean> {
    try {
      // First get current values
      const { data: currentData, error: fetchError } = await this.supabase
        .from(TableNames.USERS)
        .select("current_month_usage, current_day_usage")
        .eq("id", userId)
        .single();

      if (fetchError) {
        Sentry.captureException(fetchError);
        return false;
      }

      // Then update with incremented values
      const { error: updateError } = await this.supabase
        .from(TableNames.USERS)
        .update({
          current_month_usage: (currentData.current_month_usage || 0) + 1,
          current_day_usage: (currentData.current_day_usage || 0) + 1,
        })
        .eq("id", userId);

      if (updateError) {
        Sentry.captureException(updateError);
        return false;
      }

      return true;
    } catch (error) {
      Sentry.captureException(error);
      return false;
    }
  }

  private async resetDailyQuota(userId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from(TableNames.USERS)
        .update({
          current_day_usage: 0,
          last_day_reset: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) {
        Sentry.captureException(error);
        return false;
      }

      return true;
    } catch (error) {
      Sentry.captureException(error);
      return false;
    }
  }

  private async resetMonthlyQuota(userId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from(TableNames.USERS)
        .update({
          current_month_usage: 0,
          last_month_reset: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) {
        Sentry.captureException(error);
        return false;
      }

      return true;
    } catch (error) {
      Sentry.captureException(error);
      return false;
    }
  }

  async upgradeSubscription(userId: string, newPriceId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from(TableNames.USERS)
        .update({
          product_id: newPriceId,
        })
        .eq("id", userId);

      if (error) {
        Sentry.captureException(error);
        return false;
      }

      return true;
    } catch (error) {
      Sentry.captureException(error);
      return false;
    }
  }
}
