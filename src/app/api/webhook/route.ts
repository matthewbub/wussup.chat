// TO ADD OR MODIFY THESE PERMISSIONS IN STRIPE, GO TO:
// Go to your Stripe dashboard, then select the Developer tab in the left sidebar.
// Then select the Webhooks section.
// Then select/ create a Webhook.
// Then modify the permissions for the webhook.

// Add the following permissions:
// - customer.subscription.updated
// - customer.subscription.deleted
// - checkout.session.completed
// - checkout.session.async_payment_succeeded
// - charge.updated

import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase-server";
import { TableNames } from "@/constants/tables";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// This is your Stripe CLI webhook secret for testing your endpoint locally.
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  const reqHeaders = await headers();
  const signature = reqHeaders.get("stripe-signature")!;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Webhook Error:", err);
      return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    } else {
      console.error("Unknown error occurred", err);
      return NextResponse.json({ error: "Unknown error occurred" }, { status: 400 });
    }
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object as Stripe.Checkout.Session;
      await fulfillOrder(session);
      break;
    case "checkout.session.async_payment_succeeded":
      const sessionAsync = event.data.object as Stripe.Checkout.Session;
      await fulfillSubscription(sessionAsync);
      break;
    case "customer.subscription.updated":
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionUpdate(subscription);
      break;
    case "customer.subscription.deleted":
      const canceledSubscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionCancellation(canceledSubscription);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true }, { status: 200 });
}

async function fulfillOrder(session: Stripe.Checkout.Session) {
  const supabase = await createClient();
  try {
    // 1. Check if we've already processed this session
    const { data: existingSession, error: existingSessionError } = await supabase
      .from(TableNames.USERS)
      .select()
      .eq("checkout_session_id", session.id)
      .single();

    if (existingSessionError && !existingSessionError.message.includes("No rows found")) {
      console.error("Error checking for existing session:", existingSessionError);
      return NextResponse.json({ error: "Error checking for existing session" }, { status: 500 });
    }

    if (existingSession) {
      return NextResponse.json({ message: "Session already processed" }, { status: 200 });
    }

    // 2. Get customer details and expanded session data
    const checkoutSession = await stripe.checkout.sessions.retrieve(session.id, {
      expand: ["subscription"],
    });
    const customerId = checkoutSession.customer as string;
    const userId = checkoutSession.metadata?.userId;

    if (!userId) {
      return NextResponse.json({ error: "No user ID found in session metadata" }, { status: 400 });
    }

    // 3. Calculate subscription details
    let subscriptionPeriodEnd;
    if (checkoutSession.subscription) {
      const subscription = checkoutSession.subscription as Stripe.Subscription;
      subscriptionPeriodEnd = new Date(subscription.current_period_end * 1000);
    } else {
      // Fallback to duration-based calculation for one-time purchases
      const priceId = session.line_items?.data[0]?.price?.id;
      let durationInDays = 30; // default to 1 month

      if (priceId === process.env.STRIPE_PRICE_ID_FOR__PRO_PLAN_ALPHA_THREE_MONTHS) {
        durationInDays = 90;
      } else if (priceId === process.env.STRIPE_PRICE_ID_FOR__PRO_PLAN_ALPHA_TWELVE_MONTHS) {
        durationInDays = 365;
      }

      subscriptionPeriodEnd = new Date();
      subscriptionPeriodEnd.setDate(subscriptionPeriodEnd.getDate() + durationInDays);
    }

    // 4. Update user's subscription status in Supabase
    const { error } = await supabase
      .from(TableNames.USERS)
      .update({
        stripe_customer_id: customerId,
        subscription_status: "active",
        checkout_session_id: session.id,
        subscription_period_end: subscriptionPeriodEnd.toISOString(),
        stripe_subscription_id:
          typeof checkoutSession.subscription === "string"
            ? checkoutSession.subscription
            : checkoutSession.subscription?.id,
      })
      .eq("id", userId);

    if (error) {
      console.error("Error updating user:", error);
      return NextResponse.json({ error: "Failed to update user subscription status" }, { status: 500 });
    }

    console.log(`Successfully fulfilled order for session ${session.id}`);
    return NextResponse.json({ message: "Successfully processed checkout session" }, { status: 200 });
  } catch (error) {
    console.error("Fulfillment error:", error);
    return NextResponse.json({ error: "Internal server error processing checkout" }, { status: 500 });
  }
}

async function fulfillSubscription(session: Stripe.Checkout.Session) {
  const supabase = await createClient();
  try {
    // 1. Check if we've already processed this session
    const { data: existingSession, error: existingSessionError } = await supabase
      .from(TableNames.USERS)
      .select()
      .eq("checkout_session_id", session.id)
      .single();

    if (
      existingSessionError &&
      (!existingSessionError.message.includes("No rows found") ||
        !existingSessionError.message.includes("The result contains 0 rows"))
    ) {
      console.error("Error checking for existing session:", existingSessionError);
    }

    if (existingSession) {
      return NextResponse.json({ message: `Session ${session.id} already fulfilled` }, { status: 200 });
    }

    // 2. Retrieve the full session details
    const checkoutSession = await stripe.checkout.sessions.retrieve(session.id, {
      expand: ["subscription"],
    });

    // 3. Verify payment status
    if (checkoutSession.payment_status === "unpaid") {
      return NextResponse.json({ message: `Session ${session.id} is unpaid` }, { status: 200 });
    }

    // 4. Get customer and subscription details
    const customerId = checkoutSession.customer as string;
    const subscriptionId =
      typeof checkoutSession.subscription === "string"
        ? checkoutSession.subscription
        : checkoutSession.subscription?.id;
    const subscription = checkoutSession.subscription as Stripe.Subscription;

    // 5. Update user's subscription status in Supabase
    const { data: existingUser, error: userError } = await supabase
      .from(TableNames.USERS)
      .select()
      .eq("email", session.customer_email || session.customer_details?.email)
      .single();

    const userId = existingUser?.id;
    if (userError || !userId) {
      console.error("Error getting user:", userError);
      return NextResponse.json({ message: `Error getting user: ${userError?.message}` }, { status: 500 });
    }

    const { error } = await supabase
      .from(TableNames.USERS)
      .upsert({
        clerk_user_id: userId,
        email: session.customer_email || session.customer_details?.email,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        subscription_status: "active",
        checkout_session_id: session.id,
        subscription_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      })
      .eq("email", session.customer_email || session.customer_details?.email);

    if (error) {
      console.error("Error updating user:", error);
      throw error;
    }

    console.log(`Successfully fulfilled session ${session.id}`);
  } catch (error) {
    console.error("Fulfillment error:", error);
    throw error; // Re-throw to trigger webhook retry
  }
}

// type Status =
// | 'active'
// | 'canceled'
// | 'incomplete'
// | 'incomplete_expired'
// | 'past_due'
// | 'paused'
// | 'trialing'
// | 'unpaid';
async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const supabase = await createClient();
  try {
    const { error } = await supabase
      .from(TableNames.USERS)
      .update({
        subscription_status: subscription.status,
        subscription_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      })
      .eq("stripe_subscription_id", subscription.id);

    if (error) {
      console.error("Error updating subscription status:", error);
      throw error;
    }

    console.log(`Updated subscription ${subscription.id} status to ${subscription.status}`);
  } catch (error) {
    console.error("Subscription update error:", error);
    throw error;
  }
}

async function handleSubscriptionCancellation(canceledSubscription: Stripe.Subscription) {
  const supabase = await createClient();
  try {
    const { error } = await supabase
      .from(TableNames.USERS)
      .update({
        subscription_status: "canceled",
        subscription_period_end: new Date(canceledSubscription.current_period_end * 1000).toISOString(),
      })
      .eq("stripe_subscription_id", canceledSubscription.id);

    if (error) {
      console.error("Error updating subscription status:", error);
      throw error;
    }

    console.log("Subscription canceled:", canceledSubscription);
  } catch (error) {
    console.error("Subscription cancellation error:", error);
    throw error;
  }
}
