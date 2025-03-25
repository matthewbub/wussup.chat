import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";
import { getUser, supabaseFacade } from "@/lib/server-utils";
import * as Sentry from "@sentry/nextjs";
import { TableNames } from "@/constants/tables";

export async function POST(req: Request) {
  const body = await req.json();
  const { sessionId, aiMessage } = body;

  // Initialize Supabase client
  const supabase = await createClient();

  const user = await getUser(req);
  const userData = await supabaseFacade.getOrMakeUser(user);

  if ("error" in userData) {
    Sentry.captureException(userData.error);
    return NextResponse.json({ error: userData.error }, { status: 500 });
  }

  const { error: sessionError } = await supabase.from(TableNames.CHAT_SESSIONS).upsert({
    id: sessionId,
    user_id: userData?.id,
  });

  if (sessionError) {
    Sentry.captureException(sessionError);
    return NextResponse.json({ error: "Failed to fetch session" }, { status: 500 });
  }

  // Store chat usage data
  const { error } = await supabase.from(TableNames.CHAT_MESSAGES).insert({
    chat_session_id: sessionId,
    user_id: userData?.id,
    model: aiMessage.model,
    input: aiMessage.input,
    output: aiMessage.output,
    prompt_tokens: aiMessage.prompt_tokens,
    completion_tokens: aiMessage.completion_tokens,
  });

  if (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "Failed to store chat usage" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
