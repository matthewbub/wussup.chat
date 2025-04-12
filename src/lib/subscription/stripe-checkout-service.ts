import Stripe from "stripe";
import { isPriceIdValid, handleSubscriptionError } from "./subscription-helpers";

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

/**
 * Create a checkout session for a user
 */
export async function createCheckoutSession(
  userId: string,
  priceId: string
): Promise<{
  success: boolean;
  url?: string;
  error?: string;
}> {
  try {
    // Validate price ID
    if (!isPriceIdValid(priceId)) {
      return {
        success: false,
        error: "Invalid price ID",
      };
    }

    // Create checkout session with appropriate mode
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      metadata: {
        userId: userId,
      },
    };

    sessionConfig.subscription_data = {
      metadata: {
        userId: userId,
      },
    };

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
