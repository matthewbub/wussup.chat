import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { history } = await request.json();

  const chatHistory = await prisma.chatHistory.create({
    data: {
      userId,
      chatName: "Untitled Chat",
      history: JSON.stringify(history),
      updatedAt: new Date(),
    },
  });

  return NextResponse.json(chatHistory);
}
