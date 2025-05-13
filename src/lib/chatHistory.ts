import { prisma } from "@/lib/prisma";
import { ChatHistory } from "@/generated/prisma";
import { MessagePart } from "@/app/types";
import { StatusTypes } from "@/components/messages";
import { STATUS_TYPES } from "@/constants/stream";

interface ChatHistoryListItem {
  id: string;
  chatName: string;
}

interface ChatHistoryResponse {
  chatHistories: ChatHistoryListItem[];
  selectedChatHistory: ChatHistory | null;
}

export async function getChatHistories(
  userId: string,
  selectedId?: string
): Promise<ChatHistoryResponse> {
  const chatHistories = await prisma.chatHistory.findMany({
    where: { userId },
    select: { id: true, chatName: true },
    orderBy: { updatedAt: "desc" },
  });

  let selectedChatHistory = null;
  if (selectedId) {
    selectedChatHistory = await prisma.chatHistory.findFirst({
      where: { userId, id: selectedId },
    });
  }

  return {
    chatHistories,
    selectedChatHistory,
  };
}

export async function unpackHistory(history: string) {
  try {
    if (history) {
      const messages = JSON.parse(history);
      return messages;
    }
    return [];
  } catch (error) {
    console.error(error);
    return [];
  }
}
export async function removeStatusMessages(history: string) {
  const unpackedMessages = await unpackHistory(history);

  return unpackedMessages.filter(
    (message: MessagePart) =>
      !STATUS_TYPES.includes(message.type as StatusTypes)
  );
}
