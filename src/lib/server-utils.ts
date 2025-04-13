import { clerkClient } from "@clerk/nextjs/server";
import Stripe from "stripe";

// this whole func is assuming there is only one active subscription per user
export async function isUserSubscribed(userId: string) {
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const metadata = user.privateMetadata || {};
  const stripeCustomerId = metadata.stripe_customer_id;

  if (!stripeCustomerId) {
    return {
      isSubscribed: false,
      currentPeriodEnd: null,
      currentPeriodStart: null,
    };
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const subscriptions = await stripe.subscriptions.list({
    customer: stripeCustomerId as string,
    status: "active",
  });

  const currentPeriodEnd = subscriptions.data[0].current_period_end;
  const currentPeriodStart = subscriptions.data[0].current_period_start;

  return {
    isSubscribed: subscriptions.data.length > 0,
    currentPeriodEnd: currentPeriodEnd ? new Date(currentPeriodEnd * 1000) : null,
    currentPeriodStart: currentPeriodStart ? new Date(currentPeriodStart * 1000) : null,
    cancelAtPeriodEnd: subscriptions.data[0].cancel_at_period_end,
  };
}

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
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  try {
    // Validate price ID
    if (priceId !== process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_FOR__PRO_PLAN_ALPHA_ONE_MONTH_RECURRING) {
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
    console.error(error);
    return {
      success: false,
      error: "Failed to create checkout session",
    };
  }
}
