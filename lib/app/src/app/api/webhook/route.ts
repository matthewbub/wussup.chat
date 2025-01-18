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

  console.log("signature", signature);
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
  } catch (err: any) {
    console.error("Webhook Error:", err);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded":
      const session = event.data.object as Stripe.Checkout.Session;
      // Handle successful payment
      console.log("session being fulfilled", session);
      await fulfillSubscription(session);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true }, { status: 200 });
}

async function fulfillSubscription(session: Stripe.Checkout.Session) {
  console.log(`Fulfilling Checkout Session ${session.id}`);

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
      !existingSessionError.message.includes("No rows found")
    ) {
      console.error(
        "Error checking for existing session:",
        existingSessionError
      );
    }

    if (existingSession) {
      console.log(`Session ${session.id} already fulfilled`);
      return;
    }

    // 2. Retrieve the full session details
    const checkoutSession = await stripe.checkout.sessions.retrieve(
      session.id,
      {
        expand: ["subscription"],
      }
    );

    console.log("checkoutSession", checkoutSession);
    // 3. Verify payment status
    if (checkoutSession.payment_status === "unpaid") {
      console.log(`Session ${session.id} is unpaid`);
      return;
    }

    console.log("checkoutSession", checkoutSession);
    console.log("session", session);
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

    const userId = existingUser?.id || crypto.randomUUID();
    console.log("existingUser", existingUser);
    console.log("userError", userError);

    const { error } = await supabase
      .from("ChatBot_Users")
      .upsert({
        id: userId,
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
