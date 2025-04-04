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
import * as Sentry from "@sentry/nextjs";
import { handleSubscriptionError } from "@/lib/subscription/subscription-helpers";
import { StripeWebhookService } from "@/lib/subscription/stripe-webhook-service";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
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
      Sentry.captureException(err);
      return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    } else {
      console.error("Unknown error occurred", err);
      Sentry.captureException(new Error("Unknown webhook error"));
      return NextResponse.json({ error: "Unknown error occurred" }, { status: 400 });
    }
  }

  try {
    let result;

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object as Stripe.Checkout.Session;
        result = await StripeWebhookService.handleCheckoutSessionCompleted(session);
        break;

      case "customer.subscription.updated":
        const subscription = event.data.object as Stripe.Subscription;
        result = await StripeWebhookService.handleSubscriptionUpdated(subscription);
        break;

      case "customer.subscription.deleted":
        const canceledSubscription = event.data.object as Stripe.Subscription;
        result = await StripeWebhookService.handleSubscriptionCancelled(canceledSubscription);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
        result = { success: true, message: `Unhandled event type: ${event.type}` };
    }

    console.log(`[${event.type}] ${result.message}`);
    return NextResponse.json({ received: true, success: result.success }, { status: 200 });
  } catch (error) {
    handleSubscriptionError(error, `webhook-${event.type}`);
    return NextResponse.json({ error: "Error processing webhook event" }, { status: 500 });
  }
}
