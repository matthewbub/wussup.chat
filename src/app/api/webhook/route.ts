// TO ADD OR MODIFY THESE PERMISSIONS IN STRIPE, GO TO:
// Go to your Stripe dashboard, then select the Developer tab in the left sidebar.
// Then select the Webhooks section.
// Then select/ create a Webhook.
// Then modify the permissions for the webhook.

// Add the following permissions:
// - customer.subscription.updated
// - customer.subscription.deleted
// - checkout.session.completed
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

    if (existingSessionError && !existingSessionError.details.includes("0 rows")) {
      console.error("[fulfillOrder] Error checking for existing session:", existingSessionError);
      return NextResponse.json({ error: "Error checking for existing session" }, { status: 500 });
    }
    if (existingSession) {
      return NextResponse.json({ message: "Session already processed" }, { status: 200 });
    }

    // 2. Verify payment status
    if (session.payment_status !== "paid") {
      console.log(`Session ${session.id} payment status is ${session.payment_status}`);
      return NextResponse.json({ message: `Payment status is ${session.payment_status}` }, { status: 200 });
    }

    // 3. Get full session details with line items
    const checkoutSession = await stripe.checkout.sessions.retrieve(session.id, {
      expand: ["line_items"],
    });

    // 4. Get or create customer
    let customerId: string;
    if (session.customer) {
      customerId = session.customer as string;
    } else {
      const customer = await stripe.customers.create({
        email: session.customer_details?.email,
        name: session.customer_details?.name,
        metadata: {
          userId: session.metadata?.userId,
        },
      } as Stripe.CustomerCreateParams);
      customerId = customer.id;
    }

    // 5. Calculate subscription details
    const subscriptionPeriodEnd = new Date();
    const priceId = checkoutSession.line_items?.data[0]?.price?.id;
    if (!priceId) {
      console.error("Session details:", checkoutSession);
      throw new Error("No price ID found in expanded session");
    }

    let durationInDays = 30;
    switch (priceId) {
      case process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_FOR__PRO_PLAN_ALPHA_ONE_MONTH:
        durationInDays = 30;
        break;
      case process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_FOR__PRO_PLAN_ALPHA_THREE_MONTHS:
        durationInDays = 90;
        break;
      case process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_FOR__PRO_PLAN_ALPHA_TWELVE_MONTHS:
        durationInDays = 365;
        break;
      case process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_FOR__PRO_PLAN_ALPHA_ONE_MONTH_RECURRING:
        durationInDays = 30;
        break;
    }

    subscriptionPeriodEnd.setDate(subscriptionPeriodEnd.getDate() + durationInDays);

    // 6. Record the purchase in purchase_history
    const { error: purchaseError } = await supabase.from(TableNames.PURCHASE_HISTORY).insert({
      user_id: session.metadata?.userId,
      stripe_customer_id: customerId,
      stripe_checkout_session_id: session.id,
      price_id: priceId,
      amount_paid: session.amount_total || 0,
      currency: session.currency || "usd",
      payment_status: session.payment_status,
      purchase_date: new Date(session.created * 1000).toISOString(),
      subscription_period_start: new Date().toISOString(),
      subscription_period_end: subscriptionPeriodEnd.toISOString(),
      payment_type: "one-time",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (purchaseError) {
      console.error("Error recording purchase:", purchaseError);
      // Continue with the rest of the fulfillment even if purchase recording fails
    }

    // 7. Update user's subscription status in Supabase
    const { error } = await supabase
      .from(TableNames.USERS)
      .update({
        stripe_customer_id: customerId,
        subscription_status: "active",
        checkout_session_id: session.id,
        subscription_period_end: subscriptionPeriodEnd.toISOString(),
        payment_status: session.payment_status,
        product_id: priceId,
      })
      .eq("id", session.metadata?.userId);

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
    // Record the subscription update in purchase history
    const { error: purchaseError } = await supabase.from(TableNames.PURCHASE_HISTORY).insert({
      user_id: subscription.metadata.userId, // Make sure this is set in your subscription metadata
      stripe_customer_id: subscription.customer as string,
      stripe_subscription_id: subscription.id,
      price_id: subscription.items.data[0]?.price.id,
      amount_paid: subscription.items.data[0]?.price.unit_amount || 0,
      currency: subscription.currency,
      payment_status: subscription.status,
      purchase_date: new Date(subscription.current_period_start * 1000).toISOString(),
      subscription_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      subscription_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      payment_type: "subscription",
      event_type: "subscription_updated",
    });

    if (purchaseError) {
      console.error("Error recording subscription update:", purchaseError);
    }

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
    // Record the cancellation in purchase history
    const { error: purchaseError } = await supabase.from(TableNames.PURCHASE_HISTORY).insert({
      user_id: canceledSubscription.metadata.userId,
      stripe_customer_id: canceledSubscription.customer as string,
      stripe_subscription_id: canceledSubscription.id,
      price_id: canceledSubscription.items.data[0]?.price.id,
      amount_paid: 0, // No charge for cancellation
      currency: canceledSubscription.currency,
      payment_status: "canceled",
      purchase_date: new Date().toISOString(),
      subscription_period_start: new Date(canceledSubscription.current_period_start * 1000).toISOString(),
      subscription_period_end: new Date(canceledSubscription.current_period_end * 1000).toISOString(),
      payment_type: "subscription",
      event_type: "subscription_canceled",
    });

    if (purchaseError) {
      console.error("Error recording subscription cancellation:", purchaseError);
    }

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
