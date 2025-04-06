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

  const { updateSessionTitle, setSessionId, setMessages, setChatSessions, chatSessions } = useChatStore();

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

          console.log("data", data);
          const chatHistory = data.messages
            ?.filter((chat: { chat_session_id: string }) => chat.chat_session_id === session.id)
            .reduce((acc: { role: string; content: string }[], chat: { input: string; output: string }) => {
              const userMessage = {
                role: "user",
                content: chat.input,
              };
              const aiMessage = {
                role: "assistant",
                content: chat.output,
              };
              return [...acc, userMessage, aiMessage];
            }, [] as { role: string; content: string }[]);

          setMessages(chatHistory as NewMessage[]);
        };
        fetchChatHistory();
        updateSessionTitle(session.id, session.name);
        setSessionId(sessionIdFromUrl);
      }
    }
  }, [sessionIdFromUrl]);

  return <>{children}</>;
};
