import { supabase } from "@/lib/supabase";
import { tableNames } from "@/constants/tables";
import Stripe from "stripe";
import {
  isRecurringSubscription,
  handleSubscriptionError,
  calculateSubscriptionEndDate,
  getPaymentTypeFromPriceId,
} from "./subscription-helpers";

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export class StripeWebhookService {
  /**
   * Process a checkout session completion
   */
  static async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
    try {
      // 1. Check if we've already processed this session
      const { data: existingSession, error: existingSessionError } = await supabase
        .from(tableNames.USERS)
        .select()
        .eq("checkout_session_id", session.id)
        .single();

      if (existingSessionError && !existingSessionError.details.includes("0 rows")) {
        handleSubscriptionError(existingSessionError, "session-completed-check");
        throw new Error("Error checking for existing session");
      }

      if (existingSession) {
        return { success: true, message: "Session already processed" };
      }

      // 2. Verify payment status
      if (session.payment_status !== "paid") {
        return { success: true, message: `Payment status is ${session.payment_status}` };
      }

      // 3. Get full session details with line items
      const checkoutSession = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ["line_items"],
      });

      // 4. Get or create customer
      const customerId = await this.getOrCreateCustomer(session);

      // 5. Calculate subscription details
      const priceId = checkoutSession.line_items?.data[0]?.price?.id;
      if (!priceId) {
        const error = new Error("No price ID found in expanded session");
        handleSubscriptionError(error, "session-completed-no-price");
        throw error;
      }

      // 6. Calculate subscription dates
      const { subscriptionPeriodStart, subscriptionPeriodEnd, isSubscription, paymentType } =
        await this.calculateSubscriptionDates(priceId, session);

      // 7. Record the purchase in purchase_history
      await this.recordPurchase(
        supabase,
        session,
        customerId,
        priceId,
        isSubscription,
        subscriptionPeriodStart,
        subscriptionPeriodEnd,
        paymentType
      );

      // 8. Update user's subscription status
      await this.updateUserSubscription(supabase, session, customerId, priceId, isSubscription, subscriptionPeriodEnd);

      return { success: true, message: `Successfully fulfilled order for session ${session.id}` };
    } catch (error) {
      handleSubscriptionError(error, "session-completed");
      throw error;
    }
  }

  /**
   * Process a subscription update
   */
  static async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    try {
      // Verify the subscription has userId metadata
      if (!subscription.metadata.userId) {
        handleSubscriptionError(
          new Error(`Subscription ${subscription.id} missing userId metadata`),
          "subscription-update-missing-userid"
        );
        return { success: false, message: "Missing userId in metadata" };
      }

      // Record the subscription update
      await this.recordSubscriptionEvent(supabase, subscription, "subscription_updated");

      // Update user record
      const userId = subscription.metadata.userId;
      await this.updateUserSubscriptionStatus(supabase, subscription, userId);

      return {
        success: true,
        message: `Updated subscription ${subscription.id} status to ${subscription.status}`,
      };
    } catch (error) {
      handleSubscriptionError(error, "subscription-update");
      throw error;
    }
  }

  /**
   * Process a subscription cancellation
   */
  static async handleSubscriptionCancelled(subscription: Stripe.Subscription) {
    try {
      // Verify the subscription has userId metadata or find it
      let userId = subscription.metadata.userId;

      if (!userId) {
        const result = await this.findUserIdBySubscriptionId(supabase, subscription.id);
        if (!result.success) {
          return { success: false, message: result.message };
        }
        userId = result.userId!;
      }

      // Record the cancellation
      await this.recordSubscriptionEvent(supabase, subscription, "subscription_canceled", userId);

      // Update user record
      await this.updateUserCancellation(supabase, subscription, userId);

      return {
        success: true,
        message: `Cancelled subscription ${subscription.id}`,
      };
    } catch (error) {
      handleSubscriptionError(error, "subscription-cancel");
      throw error;
    }
  }

  /**
   * Get or create a customer in Stripe
   */
  private static async getOrCreateCustomer(session: Stripe.Checkout.Session): Promise<string> {
    if (session.customer) {
      return session.customer as string;
    }

    const customer = await stripe.customers.create({
      email: session.customer_details?.email,
      name: session.customer_details?.name,
      metadata: {
        userId: session.metadata?.userId,
      },
    } as Stripe.CustomerCreateParams);

    return customer.id;
  }

  /**
   * Calculate subscription dates and determine payment type
   */
  private static async calculateSubscriptionDates(priceId: string, session: Stripe.Checkout.Session) {
    const isSubscription = isRecurringSubscription(priceId);
    const paymentType = getPaymentTypeFromPriceId(priceId);

    const now = new Date();
    const subscriptionPeriodStart = new Date(now);
    let subscriptionPeriodEnd = calculateSubscriptionEndDate(priceId, subscriptionPeriodStart);

    // For subscriptions, use Stripe's period end if available
    if (isSubscription && session.subscription) {
      try {
        const subscriptionData = await stripe.subscriptions.retrieve(session.subscription as string);
        if (subscriptionData.current_period_end) {
          subscriptionPeriodEnd = new Date(subscriptionData.current_period_end * 1000);
        }
      } catch (error) {
        handleSubscriptionError(error, "calculate-dates-subscription-retrieval");
        // Continue with our calculated dates as fallback
      }
    }

    return {
      subscriptionPeriodStart,
      subscriptionPeriodEnd,
      isSubscription,
      paymentType,
    };
  }

  /**
   * Record a purchase in the purchase_history table
   */
  private static async recordPurchase(
    supabase: any,
    session: Stripe.Checkout.Session,
    customerId: string,
    priceId: string,
    isSubscription: boolean,
    subscriptionPeriodStart: Date,
    subscriptionPeriodEnd: Date,
    paymentType: "recurring" | "one-time"
  ) {
    const { error } = await supabase.from(tableNames.PURCHASE_HISTORY).insert({
      user_id: session.metadata?.userId,
      stripe_customer_id: customerId,
      stripe_checkout_session_id: session.id,
      stripe_subscription_id: isSubscription ? session.subscription : null,
      price_id: priceId,
      amount_paid: session.amount_total || 0,
      currency: session.currency || "usd",
      payment_status: session.payment_status,
      purchase_date: new Date(session.created * 1000).toISOString(),
      subscription_period_start: subscriptionPeriodStart.toISOString(),
      subscription_period_end: subscriptionPeriodEnd.toISOString(),
      payment_type: paymentType,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (error) {
      handleSubscriptionError(error, "record-purchase");
      // Continue even if purchase recording fails
    }
  }

  /**
   * Update user subscription status
   */
  private static async updateUserSubscription(
    supabase: any,
    session: Stripe.Checkout.Session,
    customerId: string,
    priceId: string,
    isSubscription: boolean,
    subscriptionPeriodEnd: Date
  ) {
    const { error } = await supabase
      .from(tableNames.USERS)
      .update({
        stripe_customer_id: customerId,
        subscription_status: "active",
        checkout_session_id: session.id,
        stripe_subscription_id: isSubscription ? session.subscription : null,
        subscription_period_end: subscriptionPeriodEnd.toISOString(),
        payment_status: session.payment_status,
        product_id: priceId,
      })
      .eq("id", session.metadata?.userId);

    if (error) {
      handleSubscriptionError(error, "update-user-subscription");
      throw error;
    }
  }

  /**
   * Record a subscription event in the purchase_history table
   */
  private static async recordSubscriptionEvent(
    supabase: any,
    subscription: Stripe.Subscription,
    eventType: "subscription_updated" | "subscription_canceled",
    overrideUserId?: string
  ) {
    const userId = overrideUserId || subscription.metadata.userId;
    const amount = eventType === "subscription_canceled" ? 0 : subscription.items.data[0]?.price.unit_amount || 0;
    const paymentStatus = eventType === "subscription_canceled" ? "canceled" : subscription.status;

    const { error } = await supabase.from(tableNames.PURCHASE_HISTORY).insert({
      user_id: userId,
      stripe_customer_id: subscription.customer as string,
      stripe_subscription_id: subscription.id,
      stripe_checkout_session_id: subscription.latest_invoice,
      price_id: subscription.items.data[0]?.price.id,
      amount_paid: amount,
      currency: subscription.currency,
      payment_status: paymentStatus,
      purchase_date: new Date(subscription.current_period_start * 1000).toISOString(),
      subscription_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      subscription_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      payment_type: "subscription",
      event_type: eventType,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (error) {
      handleSubscriptionError(error, `record-subscription-${eventType}`);
    }
  }

  /**
   * Update user subscription status
   */
  private static async updateUserSubscriptionStatus(
    supabase: any,
    subscription: Stripe.Subscription,
    userId: string
  ): Promise<boolean> {
    const { error } = await supabase
      .from(tableNames.USERS)
      .update({
        stripe_subscription_id: subscription.id,
        subscription_status: subscription.status,
        subscription_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        payment_status: subscription.status,
        stripe_customer_id: subscription.customer as string,
        product_id: subscription.items.data[0]?.price.id,
      })
      .eq("id", userId);

    if (error) {
      handleSubscriptionError(error, "update-user-subscription-status");

      // Fallback to searching by subscription ID if user ID fails
      const { error: fallbackError } = await supabase
        .from(tableNames.USERS)
        .update({
          stripe_subscription_id: subscription.id,
          subscription_status: subscription.status,
          subscription_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          payment_status: subscription.status,
          stripe_customer_id: subscription.customer as string,
          product_id: subscription.items.data[0]?.price.id,
        })
        .eq("stripe_subscription_id", subscription.id);

      if (fallbackError) {
        handleSubscriptionError(fallbackError, "update-subscription-fallback");
        return false;
      }
    }

    return true;
  }

  /**
   * Update user when subscription is cancelled
   */
  private static async updateUserCancellation(supabase: any, subscription: Stripe.Subscription, userId: string) {
    const { error } = await supabase
      .from(tableNames.USERS)
      .update({
        subscription_status: "canceled",
        subscription_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        payment_status: "canceled",
        stripe_customer_id: subscription.customer as string,
        product_id: subscription.items.data[0]?.price.id,
      })
      .eq("id", userId);

    if (error) {
      handleSubscriptionError(error, "update-user-cancellation");
      throw error;
    }
  }

  /**
   * Find user ID by subscription ID
   */
  private static async findUserIdBySubscriptionId(supabase: any, subscriptionId: string) {
    const { data, error } = await supabase
      .from(tableNames.USERS)
      .select("id")
      .eq("stripe_subscription_id", subscriptionId)
      .single();

    if (error || !data) {
      handleSubscriptionError(
        new Error(`Could not find user for subscription ${subscriptionId}`),
        "find-user-by-subscription"
      );
      return { success: false, message: "User not found", userId: null };
    }

    return { success: true, message: "User found", userId: data.id };
  }
}
