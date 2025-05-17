import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";
import { appConfig } from "@/constants/app-config";
import { MessagePart } from "@/app/types";

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { chatId, history } = await request.json();

  const [chatExists, apiKeyInfo] = await Promise.all([
    prisma.chatHistory.findUnique({
      where: { id: chatId, userId },
    }),
    // this is a good candidate for a cache
    prisma.apiKeys.findFirst({
      where: { userId },
    }),
  ]);

  await prisma.stats.upsert({
    where: {
      userId,
    },
    update: {
      lifetimeMessageCount: {
        increment: 1,
      },
      dailyMessageCount: {
        increment: 1,
      },
      monthlyMessageCount: {
        increment: 1,
      },
    },
    create: {
      userId,
      lifetimeMessageCount: 1,
      dailyMessageCount: 1,
      monthlyMessageCount: 1,
      resetDate: new Date(),
    },
  });

  if (chatExists) {
    const updatedChatHistory = await prisma.chatHistory.update({
      where: { id: chatId, userId },
      data: {
        history: JSON.stringify(history),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedChatHistory);
  }

  // For new chats, generate a title based on the first message
  let chatName = "Untitled Chat";

  if (history.length > 0) {
    const firstUserMessage = history.find(
      (msg: MessagePart) =>
        msg.type === "user" || msg.type === "user.with_attachments"
    );

    if (firstUserMessage) {
      const generateNameFromContent = firstUserMessage.content;

      try {
        const openai = new OpenAI({
          apiKey: apiKeyInfo?.apiKey,
        });

        const response = await openai.chat.completions.create({
          model: appConfig.openai.chatTitle,
          messages: [
            {
              role: "system",
              content: [
                "You are a helpful assistant that generates a concise title for a chat session.",
                "The only context you have at this point is the user's first message.",
                "Please generate a concise title using up to 6 words.",
                "Text only, no special characters.",
              ].join("\n"),
            },
            {
              role: "user",
              content: generateNameFromContent,
            },
          ],
          max_tokens: 20,
        });

        const title = response.choices[0]?.message?.content?.trim();
        if (title) {
          chatName = title;
        }
      } catch (error) {
        console.error("Error generating chat title:", error);
      }
    }
  }

  // Create new chat history with generated title
  const chatHistory = await prisma.chatHistory.create({
    data: {
      id: chatId,
      userId,
      chatName,
      history: JSON.stringify(history),
      updatedAt: new Date(),
    },
  });

  return NextResponse.json(chatHistory);
}
