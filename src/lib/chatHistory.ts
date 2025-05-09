import { prisma } from "@/lib/prisma";
import { ChatHistory } from "@/generated/prisma";

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
