import { supabase } from "@/lib/supabase";
import { tableNames } from "@/constants/tables";
import Stripe from "stripe";
import { handleSubscriptionError } from "./subscription-helpers";

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export interface CancellationResponse {
  success: boolean;
  message: string;
  error?: string;
}

export class StripeSubscriptionService {
  /**
   * Cancel a user's subscription
   * @param userId - The user's ID
   * @returns Response with success/failure and message
   */
  static async cancelSubscription(userId: string): Promise<CancellationResponse> {
    try {
      // 1. Get the user's subscription information
      const { data: userData, error: userError } = await supabase
        .from(tableNames.USERS)
        .select("stripe_subscription_id, stripe_customer_id")
        .eq("id", userId)
        .single();

      if (userError || !userData?.stripe_subscription_id) {
        handleSubscriptionError(
          userError || new Error("No subscription found for user"),
          "cancel-subscription-get-user"
        );
        return {
          success: false,
          message: "No active subscription found",
          error: "No subscription to cancel",
        };
      }

      // 2. Cancel the subscription in Stripe
      const subscription = await stripe.subscriptions.update(userData.stripe_subscription_id, {
        cancel_at_period_end: true,
      });

      // 3. Record the cancellation in purchase history
      const { error: purchaseError } = await supabase.from(tableNames.PURCHASE_HISTORY).insert({
        user_id: userId,
        stripe_customer_id: userData.stripe_customer_id,
        stripe_subscription_id: userData.stripe_subscription_id,
        price_id: subscription.items.data[0]?.price.id,
        amount_paid: 0,
        currency: subscription.currency,
        payment_status: "cancellation_scheduled",
        purchase_date: new Date().toISOString(),
        subscription_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        subscription_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        payment_type: "subscription",
        event_type: "subscription_cancellation_requested",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (purchaseError) {
        handleSubscriptionError(purchaseError, "cancel-subscription-record-purchase");
        // Continue even if purchase recording fails
      }

      // 4. Update user record with cancellation pending status
      const { error: updateError } = await supabase
        .from(tableNames.USERS)
        .update({
          subscription_status: "cancellation_pending",
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (updateError) {
        handleSubscriptionError(updateError, "cancel-subscription-update-user");
        return {
          success: false,
          message: "Failed to update user status",
          error: "Database update failed",
        };
      }

      return {
        success: true,
        message: "Subscription cancellation scheduled for the end of the billing period",
      };
    } catch (error) {
      handleSubscriptionError(error, "cancel-subscription");
      return {
        success: false,
        message: "Failed to cancel subscription",
        error: error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }
}
