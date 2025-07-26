"use client";
import { useEffect } from "react";
import { create } from "zustand";
import { ChatHistory } from "@/generated/prisma";

interface MessageStats {
  dailyCount: number;
  hasPaidPlan: boolean;
}

interface ChatStore {
  selectedChatHistory: ChatHistory | null;
  chatHistories: ChatHistory[];
  isOverLimit: boolean;
  isDisabled: boolean;
  messageStats: MessageStats;
}

export const useChatStore = create<ChatStore>(() => ({
  selectedChatHistory: {
    id: "",
    userId: "",
    chatName: "",
    history: "",
    updatedAt: new Date(),
  },
  chatHistories: [],
  isOverLimit: false,
  isDisabled: false,
  messageStats: {
    dailyCount: 0,
    monthlyCount: 0,
    hasPaidPlan: false,
  },
}));

export default function ChatLifecycle({
  selectedChatHistory,
  chatHistories,
  isOverLimit,
  isDisabled,
  messageStats,
  children,
}: {
  selectedChatHistory: ChatHistory;
  chatHistories: ChatHistory[];
  isOverLimit: boolean;
  isDisabled: boolean;
  messageStats: MessageStats;
  children: React.ReactNode;
}) {
  useEffect(() => {
    useChatStore.setState({
      selectedChatHistory,
      chatHistories,
      isOverLimit,
      isDisabled,
      messageStats,
    });
  }, [
    selectedChatHistory,
    chatHistories,
    isOverLimit,
    isDisabled,
    messageStats,
  ]);

  return children;
}
