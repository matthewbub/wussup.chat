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
    const { data: session, error: sessionError } = await prisma.thread.findUnique({
      where: {
        id: sessionId,
        userId: userId,
      },
    });

    if (sessionError) {
      Sentry.captureException(sessionError);
      return NextResponse.json({ error: "Failed to fetch chat session" }, { status: 500 });
    }

    // Get all messages from the original session
    const { data: messages, error: messagesError } = await prisma.message.findMany({
      where: {
        threadId: sessionId,
        userId: userId,
      },
    });

    if (messagesError) {
      Sentry.captureException(messagesError);
      return NextResponse.json({ error: "Failed to fetch chat messages" }, { status: 500 });
    }

    const newSessionName = `${session?.name || "Chat"} (copy)`;
    const { error: newSessionError } = await prisma.thread.create({
      data: {
        id: newSessionId,
        userId: userId,
        name: newSessionName,
      },
    });

    if (newSessionError) {
      Sentry.captureException(newSessionError);
      return NextResponse.json({ error: "Failed to create new chat session" }, { status: 500 });
    }

    // Duplicate all messages with the new session ID
    if (messages && messages.length > 0) {
      const newMessages = messages.map((msg: { id: string; threadId: string; createdAt: Date }) => ({
        ...msg,
        id: crypto.randomUUID(),
        threadId: newSessionId,
        createdAt: new Date(),
      }));

      const { error: newMessagesError } = await prisma.message.createMany({
        data: newMessages,
      });

      if (newMessagesError) {
        // If message copy fails, delete the new session to maintain consistency
        await prisma.thread.delete({
          where: {
            id: newSessionId,
            userId: userId,
          },
        });
        Sentry.captureException(newMessagesError);
        return NextResponse.json({ error: "Failed to copy chat messages" }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, sessionId: newSessionId, name: newSessionName }, { status: 200 });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "Failed to duplicate chat session" }, { status: 500 });
  }
}
