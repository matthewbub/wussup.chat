// server only
import { SupabaseClient } from "@supabase/supabase-js";
import { QuotaManager } from "../quota/quota-manager";
import { SubscriptionTier } from "../quota/types";
import { TableNames } from "@/constants/tables";
import Stripe from "stripe";
import { isPriceIdValid, getPaymentTypeFromPriceId, handleSubscriptionError } from "./subscription-helpers";
import * as Sentry from "@sentry/nextjs";

interface VerifyStripeCustomerResponse {
  exists: boolean;
  productId: string | null;
  priceId: string | null;
  error?: string;
}

export interface SubscriptionStatus {
  // Payment information
  customerId: string | null;
  subscriptionStatus: string | null;
  subscriptionEndDate: Date | null;
  error?: string;
  productId?: string | null;
  planName?: SubscriptionTier | null;
  recurringOrOneTimePayment?: "recurring" | "one-time" | null;
  paymentMethodLast4?: string | null;
}

export interface PurchaseHistory {
  id: string; // UUID
  created_at: string;
  user_id: string; // UUID
  stripe_customer_id: string;
  stripe_checkout_session_id: string;
  price_id: string;
  amount_paid: number;
  currency: string;
  payment_status: string;
  purchase_date: string; // ISO timestamp
  subscription_period_start: string | null; // ISO timestamp
  subscription_period_end: string | null; // ISO timestamp
  payment_type: string | null;
  updated_at: string | null; // ISO timestamp
  plan_name?: SubscriptionTier;
}

export class SubscriptionFacade {
  private stripe: Stripe;

  constructor(private supabase: SupabaseClient, private quotaManager: QuotaManager) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  }

  private getSubscriptionStatusFactory = function ({
    customerId = null,
    subscriptionStatus = null,
    subscriptionEndDate = null,
    error = undefined,
    productId = null,
    planName = null,
    recurringOrOneTimePayment = null,
    paymentMethodLast4 = null,
  }: {
    customerId?: string | null;
    subscriptionStatus?: string | null;
    subscriptionEndDate?: Date | null;
    error?: string | undefined;
    productId?: string | null;
    planName?: SubscriptionTier | null;
    recurringOrOneTimePayment?: "recurring" | "one-time" | null;
    paymentMethodLast4?: string | null;
  }): SubscriptionStatus {
    return {
      customerId,
      subscriptionStatus,
      subscriptionEndDate,
      error,
      productId,
      planName,
      recurringOrOneTimePayment,
      paymentMethodLast4,
    };
  };

  async getSubscriptionStatus(userId: string): Promise<SubscriptionStatus> {
    try {
      const { data: paymentData, error: paymentError } = await this.supabase
        .from(TableNames.USERS)
        .select("stripe_customer_id, subscription_period_end, subscription_status, product_id")
        .eq("id", userId)
        .single();

      if (paymentError) {
        return this.getSubscriptionStatusFactory({
          error: "Could not fetch payment information",
          planName: "free",
          subscriptionStatus: "inactive",
        });
      }

      // Verify Stripe customer and get product information
      const stripeVerification = await this.verifyStripeCustomer(paymentData?.stripe_customer_id);

      // If there's an error with Stripe verification, log it but continue with local data
      if (stripeVerification.error) {
        console.warn("Stripe verification error:", stripeVerification.error);
      }

      let paymentMethodLast4 = null;
      if (paymentData?.stripe_customer_id) {
        try {
          const paymentMethods = await this.stripe.paymentMethods.list({
            customer: paymentData.stripe_customer_id,
            type: "card",
          });
          paymentMethodLast4 = paymentMethods.data[0]?.card?.last4 || null;
        } catch (error) {
          console.warn("Error fetching payment method:", error);
        }
      }

      const planName = this.getPlanFromPriceId(paymentData?.product_id || null);

      return this.getSubscriptionStatusFactory({
        customerId: paymentData?.stripe_customer_id || null,
        subscriptionStatus: stripeVerification.exists ? "active" : paymentData?.subscription_status || null,
        subscriptionEndDate: paymentData?.subscription_period_end
          ? new Date(paymentData.subscription_period_end)
          : null,
        productId: paymentData?.product_id || null,
        planName,
        recurringOrOneTimePayment: getPaymentTypeFromPriceId(paymentData?.product_id || null),
        paymentMethodLast4,
      });
    } catch (error) {
      Sentry.captureException(error);
      return this.getSubscriptionStatusFactory({
        error: "Unexpected error checking subscription status",
        planName: "free",
        subscriptionStatus: "inactive",
      });
    }
  }

  async isPriceIdActive(priceId: string): Promise<boolean> {
    return isPriceIdValid(priceId);
  }

  private stripeCustomerFactory = function ({
    exists = false,
    productId = null,
    priceId = null,
    error = undefined,
  }: {
    exists?: boolean;
    productId?: string | null;
    priceId?: string | null;
    error?: string | undefined;
  }): VerifyStripeCustomerResponse {
    return { exists, productId, priceId, error };
  };

  async verifyStripeCustomer(customerId: string | null): Promise<VerifyStripeCustomerResponse> {
    if (!customerId) {
      return this.stripeCustomerFactory({ error: "No customer ID provided" });
    }

    try {
      const customer = await this.stripe.customers.retrieve(customerId);

      if (!customer || customer.deleted) {
        return this.stripeCustomerFactory({
          error: "Customer not found or deleted",
        });
      }

      // Get the customer's subscriptions with simpler expansion
      const subscriptions = await this.stripe.subscriptions.list({
        customer: customerId,
        status: "active",
        expand: ["data.items.data.price"],
      });

      // Get the first active subscription's price ID
      const priceId = subscriptions.data[0]?.items.data[0]?.price?.id;

      if (!priceId) {
        return this.stripeCustomerFactory({ error: "No price ID found" });
      }

      // Get the product information in a separate call
      const price = await this.stripe.prices.retrieve(priceId, {
        expand: ["product"],
      });

      const productId = typeof price.product === "string" ? price.product : price.product.id;

      return this.stripeCustomerFactory({ exists: true, productId, priceId });
    } catch (error) {
      handleSubscriptionError(error, "verifyStripeCustomer");
      return this.stripeCustomerFactory({ error: error instanceof Error ? error.message : "Unknown error occurred" });
    }
  }

  getPlanFromPriceId(priceId: string | null): SubscriptionTier {
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

    if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_FOR__PRO_PLAN_ALPHA_ONE_MONTH_RECURRING) {
      return "Pro (Alpha, 1 Month Recurring)";
    }

    return "free"; // Default to free tier if price ID doesn't match
  }

  getPlanTypeFromPriceId(priceId: string | null): "recurring" | "one-time" | null {
    if (!priceId) return null;
    return getPaymentTypeFromPriceId(priceId);
  }

  async getPurchaseHistory(userId: string): Promise<PurchaseHistory[]> {
    try {
      const { data, error } = await this.supabase.from(TableNames.PURCHASE_HISTORY).select("*").eq("user_id", userId);

      if (error) {
        handleSubscriptionError(error, "getPurchaseHistory");
        return [];
      }

      return data.map((record) => ({
        ...record,
        plan_name: this.getPlanFromPriceId(record.price_id),
      }));
    } catch (error) {
      handleSubscriptionError(error, "getPurchaseHistory");
      return [];
    }
  }
}
