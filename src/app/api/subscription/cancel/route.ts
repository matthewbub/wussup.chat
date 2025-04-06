import { NextResponse } from "next/server";
import { getUser, upsertUserByIdentifier } from "@/lib/auth/auth-utils";
import { StripeSubscriptionService } from "@/lib/subscription/stripe-subscription-service";
import { handleSubscriptionError } from "@/lib/subscription/subscription-helpers";

export async function POST(req: Request) {
  try {
    const user = await getUser(req);
    const userData = await upsertUserByIdentifier(user);

    if ("error" in userData) {
      return NextResponse.json({ error: userData.error }, { status: 500 });
    }

    const result = await StripeSubscriptionService.cancelSubscription(userData.id);

    return NextResponse.json({ message: result.message });
  } catch (error) {
    handleSubscriptionError(error, "api-cancel-subscription");
    return NextResponse.json({ error: "Failed to cancel subscription" }, { status: 500 });
  }
}
