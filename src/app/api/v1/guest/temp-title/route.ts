import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import clsx from "clsx";
import { NextResponse } from "next/server";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();
  // Take only first two messages for title generation
  const titleMessages = messages.slice(0, 2);

  const { text } = await generateText({
    model: openai("gpt-4-turbo"),
    prompt: clsx([
      "Generate a brief, descriptive title (max 6 words) for this chat conversation based on the initial messages in raw text. Omit any punctuation or special characters.",
      titleMessages.map((m: { role: string; content: string }) => `${m.role}: ${m.content}`),
    ]),
  });

  return NextResponse.json({ title: text });
}
