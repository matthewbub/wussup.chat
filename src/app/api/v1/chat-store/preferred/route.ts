import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { sessionId, responseGroupId, messageId } = await req.json();

    // Get userId from Clerk instead of Supabase
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const supabase = await createClient();

    // Update all messages in the response group to not preferred
    const { error: resetError } = await supabase
      .from("ChatBot_Messages")
      .update({ is_preferred: false })
      .eq("response_group_id", responseGroupId)
      .eq("chat_session_id", sessionId)
      .eq("user_id", userId);

    if (resetError) {
      console.error("[Chat Store] Error resetting preferred messages:", resetError);
      return NextResponse.json({ error: "Failed to reset preferred messages" }, { status: 500 });
    }

    // Set the selected message as preferred
    const { error: updateError } = await supabase
      .from("ChatBot_Messages")
      .update({ is_preferred: true })
      .eq("id", messageId)
      .eq("chat_session_id", sessionId)
      .eq("user_id", userId);

    if (updateError) {
      console.error("[Chat Store] Error updating preferred message:", updateError);
      return NextResponse.json({ error: "Failed to update preferred message" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Chat Store] Error:", error);
    return NextResponse.json({ error: "Failed to update preferred message" }, { status: 500 });
  }
}
