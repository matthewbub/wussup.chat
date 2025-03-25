import { createClient } from "@/lib/supabase-server";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import clsx from "clsx";
import { getUser, supabaseFacade } from "@/lib/server-utils";
import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { TableNames } from "@/constants/tables";

export async function POST(req: Request) {
  const user = await getUser(req);

  const { messages, session_id } = await req.json();
  const supabase = await createClient();
  const userData = await supabaseFacade.getOrMakeUser(user);

  if ("error" in userData) {
    Sentry.captureException(userData.error);
    return NextResponse.json({ error: userData.error }, { status: 500 });
  }

  const { text } = await generateText({
    model: openai("gpt-4o-mini"),
    prompt: clsx([
      "Summarize the chat thread in a concise title using up to 6 words.",
      "Text only, no special characters.",
      messages.map((m: { role: string; content: string }) => `${m.role}: ${m.content}`),
    ]),
  });

  // update session title
  const { error } = await supabase.from(TableNames.CHAT_SESSIONS).upsert(
    {
      name: text,
      user_id: userData.id,
      updated_at: new Date(),
      id: session_id,
    },
    {
      onConflict: "id",
    }
  );

  if (error) {
    console.error("Error updating session title", error);
    Sentry.captureException(error);
  }

  return NextResponse.json({ success: true, text });
}
