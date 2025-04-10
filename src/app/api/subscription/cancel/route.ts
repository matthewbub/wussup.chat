import { NextResponse } from "next/server";
import { StripeSubscriptionService } from "@/lib/subscription/stripe-subscription-service";
import { handleSubscriptionError } from "@/lib/subscription/subscription-helpers";
import { auth } from "@clerk/nextjs/server";

export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await StripeSubscriptionService.cancelSubscription(userId);

    return NextResponse.json({ message: result.message });
  } catch (error) {
    handleSubscriptionError(error, "api-cancel-subscription");
    return NextResponse.json({ error: "Failed to cancel subscription" }, { status: 500 });
  }
}
