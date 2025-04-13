import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as Sentry from "@sentry/nextjs";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionIds } = await req.json();

    if (!sessionIds || !Array.isArray(sessionIds) || sessionIds.length === 0) {
      return NextResponse.json({ error: "No sessions selected" }, { status: 400 });
    }

    // Get the threads with their messages
    const threads = await prisma.thread.findMany({
      where: {
        id: { in: sessionIds },
        userId: userId,
      },
    });

    if (!threads || threads.length === 0) {
      return NextResponse.json({ error: "No threads found" }, { status: 404 });
    }

    // Get messages for these threads
    const messages = await prisma.message.findMany({
      where: {
        threadId: { in: sessionIds },
        userId: userId,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Format threads with their messages
    const formattedThreads = threads.map((thread) => ({
      id: thread.id,
      name: thread.name,
      created_at: thread.createdAt.toISOString(),
      updated_at: thread.updatedAt.toISOString(),
      pinned: thread.pinned,
      chat_history: messages
        .filter((message) => message.threadId === thread.id)
        .reduce((acc, message) => {
          acc.push({ role: "user", content: message.input });
          acc.push({ role: "assistant", content: message.output });
          return acc;
        }, [] as { role: string; content: string }[]),
    }));

    return NextResponse.json({ data: formattedThreads });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "Failed to export chat history" }, { status: 500 });
  }
}
