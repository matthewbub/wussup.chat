"use client";

import { useEffect } from "react";
import { NewMessage, useChatStore } from "@/store/chat-store";
import { useSearchParams } from "next/navigation";

export const SessionWrapper = ({
  existingData,
  isSubscribed,
  children,
}: {
  existingData: {
    id: string;
    name: string;
    created_at: string;
    updated_at: string;
    chat_history: { role: string; content: string }[];
  }[];
  isSubscribed: {
    isSubscribed: boolean;
    currentPeriodEnd: Date | null;
    currentPeriodStart: Date | null;
  };
  children: React.ReactNode;
}) => {
  // get url query params
  const searchParams = useSearchParams();
  const sessionIdFromUrl = searchParams.get("session");

  const { setChatSessions, setInitialPageData } = useChatStore();

  // Initialize chat sessions in the store
  useEffect(() => {
    setChatSessions(existingData);

    // did we already fetch this chat history?
    const session = existingData.find((session) => session.id === sessionIdFromUrl);
    if (session) {
      setInitialPageData({
        isSubscribed: isSubscribed?.isSubscribed,
        messages: session?.chat_history as NewMessage[],
        sessionId: sessionIdFromUrl || "",
      });
    }
  }, [existingData]);

  return <>{children}</>;
};
