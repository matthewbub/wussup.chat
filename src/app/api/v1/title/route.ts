import { createClient } from "@/lib/supabase-server";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import clsx from "clsx";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  // Get the userId from Clerk auth
  const { userId } = await auth();

  // Check if user is authenticated
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { messages, session_id } = await req.json();
  const supabase = await createClient();

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
      clerk_user_id: userId,
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

  return NextResponse.json({ title: text });
}
