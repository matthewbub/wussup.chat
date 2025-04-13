import { NextResponse } from "next/server";
import { createCheckoutSession } from "@/lib/server-utils";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { priceId } = await req.json();
    const result = await createCheckoutSession(userId, priceId);

    return NextResponse.json({ url: result.url });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
