import { NextResponse } from "next/server";
import { StripeCheckoutService } from "@/lib/subscription/stripe-checkout-service";
import { handleSubscriptionError } from "@/lib/subscription/subscription-helpers";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { priceId } = await req.json();
    const result = await StripeCheckoutService.createCheckoutSession(userId, priceId);

    return NextResponse.json({ url: result.url });
  } catch (error) {
    handleSubscriptionError(error, "api-create-checkout-session");
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
