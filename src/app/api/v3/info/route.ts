import { NextResponse } from "next/server";
import { getUserId } from "@/lib/chat/chat-utils";
import { supabase } from "@/lib/supabase";
import { tableNames } from "@/constants/tables";
import * as Sentry from "@sentry/nextjs";

export async function POST(req: Request) {
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sessionId, aiMessage } = await req.json();
  const { error: messageError } = await supabase.from(tableNames.CHAT_MESSAGES).insert({
    chat_session_id: sessionId,
    user_id: userId,
    model: aiMessage.model,
    input: aiMessage.input,
    output: aiMessage.output,
    prompt_tokens: aiMessage.prompt_tokens,
    completion_tokens: aiMessage.completion_tokens,
  });

  if (messageError) {
    Sentry.captureException(messageError);
    return NextResponse.json({ error: "Failed to store chat message" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
