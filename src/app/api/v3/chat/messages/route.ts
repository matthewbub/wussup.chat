import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as Sentry from "@sentry/nextjs";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const session = url.searchParams.get("session");
  if (!session) {
    return NextResponse.json({ error: "Missing session_id parameter" }, { status: 400 });
  }

  const data = await prisma.Message.findMany({
    where: {
      userId: userId,
      threadId: session,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  if (!data) {
    const error = new Error("Failed to fetch messages");
    Sentry.captureException(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ messages: data });
}
