import { createClient } from "@/lib/supabase-server";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import clsx from "clsx";
import { NextResponse } from "next/server";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, session_id } = await req.json();

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Take only first two messages for title generation
  const titleMessages = messages.slice(0, 2);

  const { text } = await generateText({
    model: openai("gpt-4-turbo"),
    prompt: clsx([
      "Summarize the chat in a concise title using up to 6 words. Text only, no special characters. If the chat is empty, use a funny Futurama quote. For example: 'Shut up and take my money!' or 'Good news everyone!'",
      titleMessages.map((m: { role: string; content: string }) => `${m.role}: ${m.content}`),
    ]),
  });

  // update session title
  const { error } = await supabase.from("ChatBot_Sessions").upsert(
    {
      name: text,
      user_id: userData.user.id,
      updated_at: new Date(),
      id: session_id,
    },
    {
      onConflict: "id",
    }
  );

  if (error) {
    console.error("[title] error updating session title:", error);
  }

  console.log("[title] text", text);
  // console.log("[title] rest", rest);
  return NextResponse.json({ title: text });
}
