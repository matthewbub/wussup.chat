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

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id");

  const queries = {
    chatHistories: prisma.chatHistory.findMany({
      where: { userId },
      select: { id: true, chatName: true },
      orderBy: { updatedAt: "desc" },
    }),
  };

  let selectedChatHistoryQuery;
  if (id) {
    selectedChatHistoryQuery = prisma.chatHistory.findFirst({
      where: { userId, id },
    });
  } else {
    selectedChatHistoryQuery = Promise.resolve(null);
  }

  const { chatHistories, selectedChatHistory } = await Promise.all([
    queries.chatHistories,
    selectedChatHistoryQuery,
  ]).then(([chatHistories, selectedChatHistory]) => ({
    chatHistories,
    selectedChatHistory,
  }));

  return NextResponse.json({
    chatHistories,
    selectedChatHistory,
  });
}
