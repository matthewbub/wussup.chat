import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { generateText } from "ai";
import clsx from "clsx";
import { google } from "@ai-sdk/google";
import { tableNames } from "@/constants/tables";
import { supabase } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { sessionId, currentInput } = await req.json();
    if (!sessionId || !currentInput) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { text } = await generateText({
      model: google("gemini-2.0-flash"),
      prompt: clsx([
        "You are a helpful assistant that generates a concise title for a chat session.",
        "The only context you have at this point is the user's first message.",
        "Please generate a concise title using up to 6 words.",
        "Text only, no special characters.",
        "Here's the first message: ",
        currentInput,
      ]),
    });

    const { error: sessionError, data: sessionData } = await supabase
      .from(tableNames.CHAT_SESSIONS)
      .upsert({
        id: sessionId,
        user_id: userId,
        name: text,
        updated_at: new Date(),
      })
      .select()
      .single();

    if (sessionError) {
      Sentry.captureException(sessionError);
      return NextResponse.json({ error: "Failed to generate title" }, { status: 500 });
    }

    return NextResponse.json({ success: true, sessionData });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "Failed to generate title" }, { status: 500 });
  }
}
