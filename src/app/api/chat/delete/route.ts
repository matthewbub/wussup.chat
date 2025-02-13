import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { error } = await supabase.rpc("delete_chat_session", {
      session_id: sessionId,
    });

    if (error) {
      console.error("Error deleting chat session:", error);
      return NextResponse.json(
        { error: "Failed to delete chat session" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in delete chat session route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
