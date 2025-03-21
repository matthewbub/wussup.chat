import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function POST(req: Request) {
  try {
    const { context } = await req.json();
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "user id is required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { error: contextError } = await supabase
      .from("ChatBot_Users")
      .update({ chat_context: context })
      .eq("clerk_user_id", userId);

    if (contextError) {
      return NextResponse.json({ error: contextError.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Context updated" }, { status: 200 });
  } catch (error) {
    console.error("[Context] Error:", error);
    return NextResponse.json({ error: "Failed to update context" }, { status: 500 });
  }
}
