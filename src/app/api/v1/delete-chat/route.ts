import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function DELETE(request: Request) {
  try {
    // Get the userId from Clerk auth
    const { userId } = await auth();

    // Check if user is authenticated
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    const supabase = await createClient();

    // Verify the chat session belongs to the authenticated user
    const { data: session } = await supabase.from("ChatBot_Sessions").select("user_id").eq("id", sessionId).single();

    if (!session || session.user_id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { error } = await supabase.rpc("delete_chat_session", {
      session_id: sessionId,
    });

    if (error) {
      console.error("Error deleting chat session:", error);
      return NextResponse.json({ error: "Failed to delete chat session" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in delete chat session route:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
