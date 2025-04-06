import { NextResponse } from "next/server";
import { getUser, upsertUserByIdentifier } from "@/lib/auth/auth-utils";
import { StripeCheckoutService } from "@/lib/subscription/stripe-checkout-service";
import { handleSubscriptionError } from "@/lib/subscription/subscription-helpers";

export async function POST(req: Request) {
  try {
    const user = await getUser(req);
    const userData = await upsertUserByIdentifier(user);

    if ("error" in userData) {
      return NextResponse.json({ error: userData.error }, { status: 500 });
    }

    const { priceId } = await req.json();
    const result = await StripeCheckoutService.createCheckoutSession(userData.id, priceId);

    return NextResponse.json({ url: result.url });
  } catch (error) {
    handleSubscriptionError(error, "api-create-checkout-session");
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
