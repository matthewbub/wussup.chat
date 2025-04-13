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

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Check file type
    if (!file.name.endsWith(".json")) {
      return NextResponse.json({ error: "File must be JSON format" }, { status: 400 });
    }

    // Read the file
    const fileContent = await file.text();
    let importData;

    try {
      importData = JSON.parse(fileContent);
    } catch (error) {
      console.error(error);
      return NextResponse.json({ error: "Invalid JSON file" }, { status: 400 });
    }

    // Validate the structure
    if (
      !importData.threads ||
      !Array.isArray(importData.threads) ||
      !importData.messages ||
      !Array.isArray(importData.messages)
    ) {
      return NextResponse.json({ error: "Invalid file format" }, { status: 400 });
    }

    // Import threads
    const threadMap = new Map(); // To keep track of old ID to new ID mapping
    const createdThreads = [];

    for (const thread of importData.threads) {
      const newThreadId = crypto.randomUUID();
      threadMap.set(thread.id, newThreadId);

      const newThread = await prisma.thread.create({
        data: {
          id: newThreadId,
          name: thread.title || "Imported chat",
          userId: userId,
          createdAt: new Date(thread.created_at) || new Date(),
          updatedAt: new Date(thread.updated_at) || new Date(),
          pinned: false,
        },
      });

      createdThreads.push(newThread);
    }

    // Import messages
    const createdMessages = [];

    for (const message of importData.messages) {
      const newThreadId = threadMap.get(message.threadId);

      // Skip if thread wasn't created
      if (!newThreadId) continue;

      const newMessage = await prisma.message.create({
        data: {
          id: crypto.randomUUID(),
          threadId: newThreadId,
          userId: userId,
          model: message.model || "unknown",
          input: message.role === "user" ? message.content : "",
          output: message.role === "assistant" ? message.content : "",
          promptTokens: 0,
          completionTokens: 0,
          createdAt: new Date(message.created_at) || new Date(),
          updatedAt: new Date(),
        },
      });

      createdMessages.push(newMessage);
    }

    return NextResponse.json({
      success: true,
      threadsImported: createdThreads.length,
      messagesImported: createdMessages.length,
    });
  } catch (error) {
    console.error(error);
    Sentry.captureException(error);
    return NextResponse.json({ error: "Failed to import chat history" }, { status: 500 });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
