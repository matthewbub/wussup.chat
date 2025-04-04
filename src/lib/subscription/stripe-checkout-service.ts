import Stripe from "stripe";
import { isPriceIdValid, isRecurringSubscription, handleSubscriptionError } from "./subscription-helpers";

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export interface CheckoutSessionResponse {
  success: boolean;
  url?: string;
  error?: string;
}

export class StripeCheckoutService {
  /**
   * Create a checkout session for a user
   * @param userId - The user's ID
   * @param priceId - The Stripe price ID for the product
   * @returns Object with checkout session URL or error
   */
  static async createCheckoutSession(userId: string, priceId: string): Promise<CheckoutSessionResponse> {
    try {
      // Validate price ID
      if (!isPriceIdValid(priceId)) {
        return {
          success: false,
          error: "Invalid price ID",
        };
      }

      // Determine if this is a one-time payment or subscription
      const isSubscription = isRecurringSubscription(priceId);

      // Create checkout session with appropriate mode
      const sessionConfig: Stripe.Checkout.SessionCreateParams = {
        payment_method_types: ["card"],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: isSubscription ? "subscription" : "payment",
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
        metadata: {
          userId: userId,
        },
      };

      // Add subscription_data only for subscription mode
      if (isSubscription) {
        sessionConfig.subscription_data = {
          metadata: {
            userId: userId,
          },
        };
      }

      const session = await stripe.checkout.sessions.create(sessionConfig);

      return {
        success: true,
        url: session.url || undefined,
      };
    } catch (error) {
      handleSubscriptionError(error, "create-checkout-session");
      return {
        success: false,
        error: "Failed to create checkout session",
      };
    }
  }
}
