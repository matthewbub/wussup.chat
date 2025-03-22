import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { Message as DBMessage } from "@/types/chat";

export async function POST(req: Request) {
  try {
    const { sessionId, aiMessage } = await req.json();
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "user id is required" }, { status: 400 });
    }

    const message: DBMessage = {
      id: aiMessage.id,
      content: aiMessage.content,
      input: aiMessage.input,
      output: aiMessage.output,
      is_user: aiMessage.is_user,
      created_at: aiMessage.created_at,
      model: aiMessage.model,
      prompt_tokens: aiMessage.prompt_tokens,
      completion_tokens: aiMessage.completion_tokens,
      chat_session_id: sessionId,
      clerk_user_id: userId,
    };

    console.log("aiMessage", aiMessage);
    console.log("sessionId", sessionId);

    const supabase = await createClient();
    const { error } = await supabase.from("ChatBot_Messages").insert(message);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Message stored" }, { status: 200 });
  } catch (error) {
    console.error("[Context] Error:", error);
    return NextResponse.json({ error: "Failed to store message" }, { status: 500 });
  }
}
