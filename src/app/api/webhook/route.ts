import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabase } from "@/services/supabase";

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
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
    } else {
      console.error("Unknown error occurred", err);
      return NextResponse.json(
        { error: "Unknown error occurred" },
        { status: 400 }
      );
    }
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded":
      const session = event.data.object as Stripe.Checkout.Session;
      await fulfillSubscription(session);
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

async function fulfillSubscription(session: Stripe.Checkout.Session) {
  try {
    // 1. Check if we've already processed this session
    const { data: existingSession, error: existingSessionError } =
      await supabase
        .from("ChatBot_Users")
        .select()
        .eq("checkoutSessionId", session.id)
        .single();

    if (
      existingSessionError &&
      (!existingSessionError.message.includes("No rows found") ||
        !existingSessionError.message.includes("The result contains 0 rows"))
    ) {
      console.error(
        "Error checking for existing session:",
        existingSessionError
      );
    }

    if (existingSession) {
      return NextResponse.json(
        { message: `Session ${session.id} already fulfilled` },
        { status: 200 }
      );
    }

    // 2. Retrieve the full session details
    const checkoutSession = await stripe.checkout.sessions.retrieve(
      session.id,
      {
        expand: ["subscription"],
      }
    );

    // 3. Verify payment status
    if (checkoutSession.payment_status === "unpaid") {
      return NextResponse.json(
        { message: `Session ${session.id} is unpaid` },
        { status: 200 }
      );
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
      .from("ChatBot_Users")
      .select()
      .eq("email", session.customer_email || session.customer_details?.email)
      .single();

    const userId = existingUser?.id;
    if (userError || !userId) {
      console.error("Error getting user:", userError);
      return NextResponse.json(
        { message: `Error getting user: ${userError?.message}` },
        { status: 500 }
      );
    }

    const { error } = await supabase
      .from("ChatBot_Users")
      .upsert({
        user_id: userId,
        email: session.customer_email || session.customer_details?.email,
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        subscriptionStatus: "active",
        checkoutSessionId: session.id,
        subscriptionPeriodEnd: new Date(
          subscription.current_period_end * 1000
        ).toISOString(),
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
  try {
    const { error } = await supabase
      .from("ChatBot_Users")
      .update({
        subscriptionStatus: subscription.status,
        subscriptionPeriodEnd: new Date(
          subscription.current_period_end * 1000
        ).toISOString(),
      })
      .eq("stripeSubscriptionId", subscription.id);

    if (error) {
      console.error("Error updating subscription status:", error);
      throw error;
    }

    console.log(
      `Updated subscription ${subscription.id} status to ${subscription.status}`
    );
  } catch (error) {
    console.error("Subscription update error:", error);
    throw error;
  }
}

async function handleSubscriptionCancellation(
  canceledSubscription: Stripe.Subscription
) {
  console.log("Subscription canceled:", canceledSubscription);
}
