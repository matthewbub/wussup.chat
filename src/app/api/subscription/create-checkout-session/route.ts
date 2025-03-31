import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getUser, supabaseFacade } from "@/lib/server-utils";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const user = await getUser(req);
    const userData = await supabaseFacade.getOrMakeUser(user);

    if ("error" in userData) {
      return NextResponse.json({ error: userData.error }, { status: 500 });
    }

    const { priceId } = await req.json();

    // Validate price ID matches one of our expected values
    const validPriceIds = [
      process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_FOR__PRO_PLAN_ALPHA_ONE_MONTH,
      process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_FOR__PRO_PLAN_ALPHA_THREE_MONTHS,
      process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_FOR__PRO_PLAN_ALPHA_TWELVE_MONTHS,
      process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_FOR__PRO_PLAN_ALPHA_ONE_MONTH_RECURRING,
    ];

    console.log("HELLOOO", validPriceIds);
    if (!priceId || !validPriceIds.includes(priceId)) {
      return NextResponse.json({ error: "Invalid price ID" }, { status: 400 });
    }

    // Create a stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "payment", // Changed to one-time payment
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      metadata: {
        userId: userData.id, // Store the user ID in metadata for webhook processing
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[stripe]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
