import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST() {
  const user = await currentUser();
  const stripe_customer_id = user?.privateMetadata.stripe_customer_id as string;

  console.log("stripe_customer_id", stripe_customer_id);
  if (!stripe_customer_id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get active subscriptions for the customer
    const subscriptions = await stripe.subscriptions.list({
      customer: stripe_customer_id,
      status: "active",
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      return NextResponse.json({ error: "No active subscription found" }, { status: 404 });
    }

    // Cancel the subscription at period end
    await stripe.subscriptions.update(subscriptions.data[0].id, {
      cancel_at_period_end: true,
    });

    return NextResponse.json({ message: "Subscription cancelled" });
  } catch (error) {
    console.error("Failed to cancel subscription", error);
    return NextResponse.json({ error: "Failed to cancel subscription" }, { status: 500 });
  }
}
