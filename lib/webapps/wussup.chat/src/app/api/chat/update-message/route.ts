import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

// this post method updates the bot's message content in the database
export async function POST(request: Request) {
  try {
    const { botMessageId, content } = await request.json();
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("ChatBot_Messages")
      .update({ content })
      .eq("id", botMessageId);

    if (error) {
      console.error("error updating message:", error);
      return NextResponse.json(
        { error: "failed to update message" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("error in update endpoint:", error);
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 }
    );
  }
}
