import { NextResponse } from "next/server";
import { generateAndUpdateTitle } from "@/lib/chat/chat-utils";
import * as Sentry from "@sentry/nextjs";

export async function POST(req: Request) {
  try {
    const { sessionId, currentInput } = await req.json();

    if (!sessionId || !currentInput) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result = await generateAndUpdateTitle(sessionId, currentInput, req);

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "Failed to generate title" }, { status: 500 });
  }
}

export const runtime = "edge";
