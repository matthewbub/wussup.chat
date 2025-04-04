import { NextResponse } from "next/server";
import { getUser, supabaseFacade } from "@/lib/server-utils";
import { StripeSubscriptionService } from "@/lib/subscription/stripe-subscription-service";
import { handleSubscriptionError } from "@/lib/subscription/subscription-helpers";

export async function POST(req: Request) {
  try {
    // Get the authenticated user
    const user = await getUser(req);
    const userData = await supabaseFacade.getOrMakeUser(user);

    if ("error" in userData) {
      return NextResponse.json({ error: userData.error }, { status: 500 });
    }

    // Cancel the subscription
    const result = await StripeSubscriptionService.cancelSubscription(userData.id);

    if (!result.success) {
      return NextResponse.json({ error: result.error || result.message }, { status: 400 });
    }

    return NextResponse.json({ message: result.message });
  } catch (error) {
    handleSubscriptionError(error, "api-cancel-subscription");
    return NextResponse.json({ error: "Failed to cancel subscription" }, { status: 500 });
  }
}
