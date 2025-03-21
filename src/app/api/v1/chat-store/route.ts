import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

type StoreChatMessage = {
  id: string;
  content: string;
  is_user: boolean;
  session_id: string;
  created_at: string;
  model?: string;
  model_provider?: string;
  metadata?: Record<string, any>;
  prompt_tokens?: number;
  completion_tokens?: number;
};

export async function POST(req: Request) {
  try {
    const { messages } = (await req.json()) as { messages: StoreChatMessage[] };

    const { userId } = await auth();
    const supabase = await createClient();

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // First, verify that the chat session belongs to the user
    const { data: sessionData, error: sessionError } = await supabase
      .from("ChatBot_Sessions")
      .select("id")
      .eq("id", messages[0].session_id)
      .eq("clerk_user_id", userId)
      .single();

    if (sessionError || !sessionData) {
      console.error("[Chat Store] Session verification error:", sessionError);
      return NextResponse.json({ error: "Invalid chat session" }, { status: 403 });
    }

    messages.map((message) => console.log("[Chat Store] Messages", message.model_provider));

    // Format all messages first
    const formattedMessages = messages.map((message) => ({
      id: message.id,
      chat_session_id: message.session_id,
      content: message.content,
      clerk_user_id: userId,
      is_user: message.is_user,
      created_at: message.created_at,
      model: message.model,
      model_provider: message.model_provider,
      metadata: message.metadata,
      prompt_tokens: message.prompt_tokens,
      completion_tokens: message.completion_tokens,
    }));

    // Perform a single bulk upsert
    const { error: upsertError } = await supabase.from("ChatBot_Messages").upsert(formattedMessages, {
      onConflict: "id",
      ignoreDuplicates: false,
    });

    // // Increment message count based on number of messages
    const { error: incrementError } = await supabase.rpc("increment_message_count_v2", {
      incoming_clerk_user_id: userId,
      increment_by: 1,
    });

    // Check for errors
    if (upsertError || incrementError) {
      console.error("[Chat Store] Errors:", { upsertError, incrementError });

      return NextResponse.json({ error: "Failed to store some messages" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Chat Store] Error:", error);
    return NextResponse.json({ error: "Failed to store messages" }, { status: 500 });
  }
}
