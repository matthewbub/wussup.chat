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

  // Get current user from request context
  const { data } = await supabase.auth.getUser();
  const userId = data?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "user id is required" }, { status: 400 });
  }

  // Ensure session exists
  const { error: sessionError } = await supabase
    .from("ChatBot_Sessions")
    .upsert({
      id: session_id,
      user_id: userId,
      updated_at: new Date().toISOString(),
    })
    .select();

  if (sessionError) {
    console.error("[title] error creating/updating session:", sessionError);
    return NextResponse.json({ error: "Failed to create/update session" }, { status: 500 });
  }

  // Take only first two messages for title generation
  const titleMessages = messages.slice(0, 2);

  const { text, ...rest } = await generateText({
    model: openai("gpt-4-turbo"),
    prompt: clsx([
      "Summarize the chat in a concise title using up to 6 words. Text only, no special characters. If the chat is empty, use a funny Futurama quote. For example: 'Shut up and take my money!' or 'Good news everyone!'",
      titleMessages.map((m: { role: string; content: string }) => `${m.role}: ${m.content}`),
    ]),
  });

  // update session title
  const { error } = await supabase
    .from("ChatBot_Sessions")
    .update({ name: text, updated_at: new Date().toISOString() })
    .eq("id", session_id);

  if (error) {
    console.error("[title] error updating session title:", error);
    return NextResponse.json({ error: "Failed to update session title" }, { status: 500 });
  }

  console.log("[title] text", text);
  console.log("[title] rest", rest);
  return NextResponse.json({ title: text });
}
