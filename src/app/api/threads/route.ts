import { NextResponse } from "next/server";
import { z } from "zod";
import clsx from "clsx";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import * as Sentry from "@sentry/nextjs";

/**
 * Update a thread's name or pin status
 */
export async function POST(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { threadId, name, pin, generateNameFromContent } = await req.json();
  const updateSchema = z.object({
    threadId: z.string().min(1),
    name: z.string().min(1).optional(),
    pin: z.boolean().optional(),
    generateNameFromContent: z.string().optional(),
  });
  const result = updateSchema.safeParse({ threadId, name, pin, generateNameFromContent });
  if (!result.success) {
    return NextResponse.json(
      {
        error: "Invalid request body",
        details: result.error.issues,
      },
      { status: 400 }
    );
  }

  let updateData: { name?: string; updated_at: Date; pinned?: boolean } = {
    updated_at: new Date(),
  };
  if (name) {
    updateData = { ...updateData, name };
  }
  if (typeof pin === "boolean") {
    updateData = { ...updateData, pinned: pin };
  }
  if (generateNameFromContent) {
    const { text } = await generateText({
      model: google("gemini-2.0-flash"),
      prompt: clsx([
        "You are a helpful assistant that generates a concise title for a chat session.",
        "The only context you have at this point is the user's first message.",
        "Please generate a concise title using up to 6 words.",
        "Text only, no special characters.",
        "Here's the first message: ",
        generateNameFromContent,
      ]),
    });
    updateData = { ...updateData, name: text };
    const data = await prisma.thread.create({
      data: {
        id: threadId,
        userId: userId,
        name: text,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    if (!data) {
      const error = new Error("Failed to insert thread");
      Sentry.captureException(error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ data });
  }

  if (!name && typeof pin !== "boolean" && !generateNameFromContent) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const data = await prisma.thread.update({
    where: {
      id: threadId,
      userId: userId,
    },
    data: updateData,
  });

  if (!data) {
    const error = new Error("Failed to update thread");
    Sentry.captureException(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

/**
 * Delete a thread and all its messages
 */
export async function DELETE(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const deleteSchema = z.object({
    threadIdArray: z.array(z.string().min(1)),
  });

  const result = deleteSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      {
        error: "Invalid request body",
        details: result.error.issues,
      },
      { status: 400 }
    );
  }

  const { threadIdArray } = result.data;

  // Delete all messages first due to foreign key constraint
  await prisma.message.deleteMany({
    where: {
      threadId: { in: threadIdArray },
      userId: userId,
    },
  });
  await prisma.thread.deleteMany({
    where: {
      id: { in: threadIdArray },
      userId: userId,
    },
  });

  return NextResponse.json({ success: true });
}
