import { createClient } from "@/lib/supabase-server";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import clsx from "clsx";
import { getUser } from "@/lib/server-utils";
import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { TableNames } from "@/constants/tables";

export async function POST(req: Request) {
  // Get the userId from Clerk auth
  const user = await getUser(req);

  const { messages, session_id } = await req.json();
  const supabase = await createClient();

  const { text } = await generateText({
    model: openai("gpt-4o-mini"),
    prompt: clsx([
      "Summarize the chat thread in a concise title using up to 6 words.",
      "Text only, no special characters.",
      "If the chat is empty, use a fun fact about planet earth.",
      messages.map((m: { role: string; content: string }) => `${m.role}: ${m.content}`),
    ]),
  });

  // update session title
  const { error } = await supabase.from(TableNames.CHAT_SESSIONS).upsert(
    {
      name: text,
      user_id: user.userId,
      updated_at: new Date(),
      id: session_id,
    },
    {
      onConflict: "id",
    }
  );

  if (error) {
    Sentry.captureException(error);
  }

  return NextResponse.json({ success: true });
}
