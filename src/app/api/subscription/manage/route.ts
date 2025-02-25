import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase-server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get the user's Stripe customer ID from your database
    const { data: userData, error: userError } = await supabase
      .from("ChatBot_Users")
      .select("stripeCustomerId")
      .eq("user_id", user.id)
      .single();

    if (userError || !userData?.stripeCustomerId) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    // Create a Stripe billing portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: userData.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?tab=billing`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error("[stripe]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
