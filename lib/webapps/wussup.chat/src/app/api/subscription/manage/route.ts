import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabase } from "@/services/supabase";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    console.log("userId", userId);

    // Get the user's Stripe customer ID from your database
    const { data: user, error: userError } = await supabase
      .from("ChatBot_Users")
      .select("stripeCustomerId")
      .eq("user_id", userId)
      .single();

    console.log("[manage] user", user);

    if (userError || !user?.stripeCustomerId) {
      console.error("Error fetching customer ID:", userError);
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    // Create a Stripe billing portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?tab=billing`,
    });

    console.log("manage portalSession", portalSession);
    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error("[stripe]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
