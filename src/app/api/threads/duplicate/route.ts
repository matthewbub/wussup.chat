import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

/**
 * Duplicates a chat session and all its messages
 */
export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId, newSessionId } = await req.json();

    // Get the session to duplicate
    const session = await prisma.thread.findUnique({
      where: {
        id: sessionId,
        userId: userId,
      },
    });

    if (!session) {
      return NextResponse.json({ error: "Failed to fetch chat session" }, { status: 500 });
    }

    // Get all messages from the original session
    const messages = await prisma.message.findMany({
      where: {
        threadId: sessionId,
        userId: userId,
      },
    });

    if (!messages) {
      return NextResponse.json({ error: "Failed to fetch chat messages" }, { status: 500 });
    }

    const newSessionName = `${session?.name || "Chat"} (copy)`;
    const newSession = await prisma.thread.create({
      data: {
        id: newSessionId,
        userId: userId,
        name: newSessionName,
      },
    });

    if (!newSession) {
      return NextResponse.json({ error: "Failed to create new chat session" }, { status: 500 });
    }

    // Duplicate all messages with the new session ID
    if (messages && messages.length > 0) {
      const newMessages = messages.map(
        (msg: {
          id: string;
          threadId: string;
          createdAt: Date;
          userId: string;
          model: string;
          promptTokens: number;
          completionTokens: number;
          input: string;
          output: string;
        }) => ({
          id: crypto.randomUUID(),
          threadId: newSessionId,
          createdAt: new Date(),
          userId: msg.userId,
          model: msg.model,
          // We don't need to copy the tokens when duplicating the chat
          promptTokens: 0,
          completionTokens: 0,
          input: msg.input,
          output: msg.output,
        })
      );

      const newMessages2 = await prisma.message.createMany({
        data: newMessages,
      });

      if (!newMessages2) {
        // If message copy fails, delete the new session to maintain consistency
        await prisma.thread.delete({
          where: {
            id: newSessionId,
            userId: userId,
          },
        });
        return NextResponse.json({ error: "Failed to copy chat messages" }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, sessionId: newSessionId, name: newSessionName }, { status: 200 });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "Failed to duplicate chat session" }, { status: 500 });
  }
}
