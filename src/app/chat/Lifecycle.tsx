"use client";
import { useEffect } from "react";
import { create } from "zustand";
import { ChatHistory } from "@/generated/prisma";

interface ChatStore {
  selectedChatHistory: ChatHistory | null;
  chatHistories: ChatHistory[];
  apiKey: boolean;
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
  apiKey: false,
}));

export default function ChatLifecycle({
  selectedChatHistory,
  chatHistories,
  apiKey,
  children,
}: {
  selectedChatHistory: ChatHistory;
  chatHistories: ChatHistory[];
  apiKey: boolean;
  children: React.ReactNode;
}) {
  useEffect(() => {
    useChatStore.setState({
      selectedChatHistory,
      chatHistories,
      apiKey,
    });
  }, [selectedChatHistory, chatHistories, apiKey]);

  return children;
}
