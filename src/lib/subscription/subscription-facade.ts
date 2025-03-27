import { SupabaseClient } from "@supabase/supabase-js";
import { QuotaManager } from "../quota/quota-manager";
import { SubscriptionTier } from "../quota/types";
import { TableNames } from "@/constants/tables";

export interface SubscriptionStatus {
  // Quota information
  subscriptionTier: SubscriptionTier;
  remainingDailyQuota: number | null;
  remainingMonthlyQuota: number;
  hasQuota: boolean;

  // Payment information
  customerId: string | null;
  subscriptionStatus: string | null;
  subscriptionEndDate: Date | null;
  isActive: boolean;
  error?: string;
}

export class SubscriptionFacade {
  constructor(
    private supabase: SupabaseClient,
    private quotaManager: QuotaManager
  ) {}

  async getSubscriptionStatus(userId: string): Promise<SubscriptionStatus> {
    try {
      // Get quota information
      const quotaCheck = await this.quotaManager.checkQuota(userId);
      const userQuota = await this.quotaManager.getUserQuota(userId);

      if (!userQuota) {
        return {
          subscriptionTier: "free",
          remainingDailyQuota: null,
          remainingMonthlyQuota: 0,
          hasQuota: false,
          customerId: null,
          subscriptionStatus: null,
          subscriptionEndDate: null,
          isActive: false,
          error: "Could not fetch quota information",
        };
      }

      console.log("userId", userId);

      // Get payment information from ChatBot_Users table
      const { data: paymentData, error: paymentError } = await this.supabase
        .from(TableNames.USERS)
        .select("stripe_customer_id, subscription_period_end, subscription_status")
        .eq("id", userId)
        .single();

      console.log("paymentData", paymentData);

      if (paymentError) {
        return {
          subscriptionTier: userQuota.subscriptionTier,
          remainingDailyQuota: quotaCheck.remainingDailyQuota,
          remainingMonthlyQuota: quotaCheck.remainingMonthlyQuota,
          hasQuota: quotaCheck.hasQuota,
          customerId: null,
          subscriptionStatus: null,
          subscriptionEndDate: null,
          isActive: false,
          error: "Could not fetch payment information",
        };
      }

      return {
        subscriptionTier: userQuota.subscriptionTier,
        remainingDailyQuota: quotaCheck.remainingDailyQuota,
        remainingMonthlyQuota: quotaCheck.remainingMonthlyQuota,
        hasQuota: quotaCheck.hasQuota,
        customerId: paymentData?.stripe_customer_id || null,
        subscriptionStatus: paymentData?.subscription_status || null,
        subscriptionEndDate: paymentData?.subscription_period_end
          ? new Date(paymentData.subscription_period_end)
          : null,
        isActive: true,
      };
    } catch (error) {
      console.error("Error in getSubscriptionStatus:", error);
      return {
        subscriptionTier: "free",
        remainingDailyQuota: null,
        remainingMonthlyQuota: 0,
        hasQuota: false,
        customerId: null,
        subscriptionStatus: null,
        subscriptionEndDate: null,
        isActive: false,
        error: "Unexpected error checking subscription status",
      };
    }
  }

  async isPriceIdActive(priceId: string): Promise<boolean> {
    const validPriceIds = [
      process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_FOR__PRO_PLAN_ALPHA_ONE_MONTH,
      process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_FOR__PRO_PLAN_ALPHA_THREE_MONTHS,
      process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_FOR__PRO_PLAN_ALPHA_TWELVE_MONTHS,
    ];

    return validPriceIds.includes(priceId);
  }
}
