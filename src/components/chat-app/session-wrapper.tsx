"use client";

import { useEffect } from "react";
import { NewMessage, useChatStore } from "@/store/chat-store";
import { useSearchParams } from "next/navigation";
import { formatChatHistory } from "@/lib/format/format-utils";

export const SessionWrapper = ({
  existingData,
  children,
}: {
  existingData: {
    id: string;
    name: string;
    created_at: string;
    updated_at: string;
    chat_history: { role: string; content: string }[];
  }[];
  children: React.ReactNode;
}) => {
  // get url query params
  const searchParams = useSearchParams();
  const sessionIdFromUrl = searchParams.get("session");

  const { updateSessionTitle, setSessionId, setMessages, setChatSessions, chatSessions, setIsLoadingChatHistory } =
    useChatStore();

  // Initialize chat sessions in the store
  useEffect(() => {
    setChatSessions(existingData);
  }, [existingData]);

  useEffect(() => {
    if (sessionIdFromUrl) {
      const session = chatSessions.find((session) => session.id === sessionIdFromUrl);
      if (session) {
        const fetchChatHistory = async () => {
          const response = await fetch(`/api/v3/chat/messages?session=${sessionIdFromUrl}`);
          const data = await response.json();
          const chatHistory = formatChatHistory(
            data.messages?.filter((chat: { chat_session_id: string }) => chat.chat_session_id === session.id)
          );

          setMessages(chatHistory as NewMessage[]);
        };
        fetchChatHistory();
        updateSessionTitle(session.id, session.name);
        setSessionId(sessionIdFromUrl);
        setIsLoadingChatHistory(false);
      }
    }
  }, [sessionIdFromUrl]);

  return <>{children}</>;
};
