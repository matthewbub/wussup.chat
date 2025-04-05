import { NextResponse } from "next/server";
import { getUser, upsertUserByIdentifier } from "@/lib/server-utils";
import { StripeCheckoutService } from "@/lib/subscription/stripe-checkout-service";

export async function POST(req: Request) {
  try {
    const user = await getUser(req);
    const userData = await upsertUserByIdentifier(user);

    if ("error" in userData) {
      return NextResponse.json({ error: userData.error }, { status: 500 });
    }

    const { priceId } = await req.json();

    // Create checkout session
    const result = await StripeCheckoutService.createCheckoutSession(userData.id, priceId);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ url: result.url });
  } catch (error) {
    console.error("[stripe]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
