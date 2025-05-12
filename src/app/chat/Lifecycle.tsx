"use client";
import { useEffect } from "react";
import { create } from "zustand";
import { ChatHistory } from "@/generated/prisma";

interface ChatStore {
  selectedChatHistory: ChatHistory | null;
  chatHistories: ChatHistory[];
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
}));

export default function ChatLifecycle({
  selectedChatHistory,
  chatHistories,
  children,
}: {
  selectedChatHistory: ChatHistory;
  chatHistories: ChatHistory[];
  children: React.ReactNode;
}) {
  useEffect(() => {
    useChatStore.setState({
      selectedChatHistory,
      chatHistories,
    });
  }, [selectedChatHistory, chatHistories]);

  return children;
}
