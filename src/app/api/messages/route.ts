import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as Sentry from "@sentry/nextjs";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sessionId, aiMessage } = await req.json();
  const data = await prisma.message.create({
    data: {
      threadId: sessionId,
      userId: userId,
      model: aiMessage.model,
      input: aiMessage.input,
      output: aiMessage.output,
      promptTokens: aiMessage.prompt_tokens,
      completionTokens: aiMessage.completion_tokens,
    },
  });

  if (!data) {
    const error = new Error("Failed to store chat message");
    Sentry.captureException(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
