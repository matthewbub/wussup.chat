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

  // Take only first two messages for title generation
  const titleMessages = messages.slice(0, 2);

  const { text, ...rest } = await generateText({
    model: openai("gpt-4-turbo"),
    prompt: clsx([
      "Summarize the chat in a concise title using up to 6 words.",
      titleMessages.map(
        (m: { role: string; content: string }) => `${m.role}: ${m.content}`
      ),
    ]),
  });

  // update session title
  const { error } = await supabase
    .from("ChatBot_Sessions")
    .update({ name: text })
    .eq("id", session_id);

  if (error) {
    console.error("[title] error updating session title:", error);
  }

  console.log("[title] text", text);
  console.log("[title] rest", rest);
  return NextResponse.json({ title: text });
}
