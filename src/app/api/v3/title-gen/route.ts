import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import clsx from "clsx";
import { NextResponse } from "next/server";
import { ChatFacade } from "@/lib/chat-facade";

export async function POST(req: Request) {
  const { current_input, session_id } = await req.json();

  const { text } = await generateText({
    model: openai("gpt-4o-mini"),
    prompt: clsx([
      "You are a helpful assistant that generates a concise title for a chat session.",
      "The only context you have at this point is the user's first message.",
      "Please generate a concise title using up to 6 words.",
      "Text only, no special characters.",
      "Here's the first message: ",
      current_input,
    ]),
  });

  const result = await ChatFacade.updateChatTitle(session_id, text, req);

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ success: true, text });
}
