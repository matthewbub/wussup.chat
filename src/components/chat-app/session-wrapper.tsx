"use client";

import { useEffect } from "react";
import { NewMessage, useChatStore } from "@/store/chat-store";
import { useSearchParams } from "next/navigation";

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

  const { updateSessionTitle, setSessionId, setMessages, setChatSessions, setIsLoadingChatHistory } = useChatStore();

  // Initialize chat sessions in the store
  useEffect(() => {
    setChatSessions(existingData);

    // did we already fetch this chat history?
    const session = existingData.find((session) => session.id === sessionIdFromUrl);
    if (session) {
      setMessages(session.chat_history as NewMessage[]);
      updateSessionTitle(session.id, session.name);
      setSessionId(sessionIdFromUrl || "");
      setIsLoadingChatHistory(false);
    }
  }, [existingData]);

  return <>{children}</>;
};
