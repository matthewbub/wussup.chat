import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

type StoreChatMessage = {
  id: string;
  content: string;
  is_user: boolean;
  session_id: string;
  created_at: string;
  response_type?: "A" | "B";
  response_group_id?: string;
  parent_message_id?: string;
  model?: string;
  model_provider?: string;
  metadata?: Record<string, any>;
};

export async function POST(req: Request) {
  try {
    const { messages } = (await req.json()) as { messages: StoreChatMessage[] };

    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Insert all messages in parallel
    const messageInserts = messages.map((message) =>
      supabase.from("ChatBot_Messages").insert([
        {
          id: message.id,
          chat_session_id: message.session_id,
          content: message.content,
          user_id: userId,
          is_user: message.is_user,
          created_at: message.created_at,
          response_type: message.response_type,
          response_group_id: message.response_group_id,
          parent_message_id: message.parent_message_id,
          model: message.model,
          model_provider: message.model_provider,
          metadata: message.metadata,
        },
      ])
    );

    // Increment message count based on number of messages
    const incrementCount = supabase.rpc("increment_message_count", {
      incoming_uid: userId,
      increment_by: messages.length,
    });

    // Execute all database operations
    const results = await Promise.all([...messageInserts, incrementCount]);

    // Check for errors
    const errors = results.filter((result) => result.error);
    if (errors.length > 0) {
      console.error("[Chat Store] Errors:", errors);
      return NextResponse.json({ error: "Failed to store some messages", details: errors }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Chat Store] Error:", error);
    return NextResponse.json({ error: "Failed to store messages" }, { status: 500 });
  }
}
