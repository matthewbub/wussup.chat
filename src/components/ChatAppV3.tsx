"use client";

import { useEffect } from "react";
import { ChatAppHeader } from "@/components/_ChatAppHeader";
import { ChatAppInput } from "@/components/_ChatAppInput";
import { ChatAppMessages } from "@/components/_ChatAppMessages";
import { ChatAppSidebarV2 } from "@/components/_ChatAppSidebarV2";
import { ChatAppMobileSidebarV2 } from "@/components/_ChatAppMobileSidebarV2";
import { NewMessage, useChatStore } from "@/store/chat-store";
import * as Sentry from "@sentry/nextjs";
import { checkQuota } from "@/app/actions/chat-actions";
import { facade, processStreamingResponse } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { IconSidebar } from "./IconSidebar";
import { SubscriptionStatus } from "@/lib/subscription/subscription-facade";

const ChatAppV3 = ({
  existingData,
  userSubscriptionInfo,
}: {
  existingData: {
    id: string;
    name: string;
    created_at: string;
    updated_at: string;
    chat_history: { role: string; content: string }[];
  }[];
  userSubscriptionInfo: SubscriptionStatus;
}) => {
  // get url query params
  const searchParams = useSearchParams();
  const sessionIdFromUrl = searchParams.get("session");

  const {
    messages,
    currentInput,
    isLoading,
    selectedModel,
    sessionId,
    setInput,
    addMessage,
    updateLastMessage,
    setLoading,
    setChatTitle,
    setSessionId,
    setMessages,
    setChatSessions,
    chatSessions,
    setModel,
  } = useChatStore();

  // Initialize chat sessions in the store
  useEffect(() => {
    setChatSessions(existingData);
  }, [existingData]);

  useEffect(() => {
    if (sessionIdFromUrl) {
      const session = existingData.find((session) => session.id === sessionIdFromUrl);
      if (session) {
        setChatTitle(session.name || "New Chat");
        setSessionId(sessionIdFromUrl);
        setMessages(session.chat_history as NewMessage[]);
      }
    }
  }, [sessionIdFromUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // reject if no input or loading
    if (!currentInput.trim() || isLoading) return;

    addMessage(facade.humanMessage(currentInput));
    setInput("");

    setLoading(true);

    try {
      // Check quota first before adding any messages
      const quotaCheck = await checkQuota();

      if ("error" in quotaCheck) {
        // Add user message and error message to chat
        addMessage(
          facade.aiMessage(
            quotaCheck.error || "You have reached your message limit. Please try again later or upgrade your plan."
          )
        );
        throw new Error(quotaCheck.error);
      }

      // Add empty AI message that will be streamed
      const aiMessage = facade.aiMessage("");
      addMessage(aiMessage);

      const isFirstMessage = messages.length === 0;
      // Only proceed with title and message generation if quota check passes
      if (isFirstMessage) {
        const titleData = await facade.updateSessionTitle(sessionId, currentInput);
        setChatTitle(titleData.title || "New Chat - Dev");
      }

      const response = await facade.fetchAiMessage({
        input: currentInput,
        model: selectedModel.id,
        provider: selectedModel.provider,
        messages,
        sessionId,
      });

      if (!response.ok) throw new Error("Failed to send message");
      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader available");
      await processStreamingResponse(
        reader,
        // Update content on each chunk
        (content: string) => {
          aiMessage.content += content;
          updateLastMessage(aiMessage.content);
        },
        // Handle metadata (usage info) when stream completes
        (usage: { promptTokens: number; completionTokens: number }) =>
          facade.postChatInfo({
            sessionId,
            aiMessage,
            currentInput,
            usage,
          })
      );
    } catch (error: unknown) {
      console.error("Error:", error);
      // Don't override quota error messages
      if (error instanceof Error && !error.message.includes("limit")) {
        Sentry.captureException(error);
        console.error("Error:", error);
        updateLastMessage("Sorry, there was an error generating the response.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      {/* App navigation */}
      <IconSidebar />

      {/* Desktop Sidebar */}
      <div className="hidden md:block w-72 border-r border-border">
        <ChatAppSidebarV2 existingData={chatSessions} sessionId={sessionId} />
      </div>

      {/* Mobile Sidebar */}
      <ChatAppMobileSidebarV2 sessionId={sessionId} />

      <main className="flex flex-1 flex-col">
        <ChatAppHeader />
        <ChatAppMessages messages={messages} />
        <ChatAppInput
          currentInput={currentInput}
          setInput={setInput}
          isLoading={isLoading}
          onSubmit={handleSubmit}
          selectedModel={selectedModel}
          onModelChange={setModel}
          userSubscriptionInfo={userSubscriptionInfo}
        />
      </main>
    </div>
  );
};

export default ChatAppV3;
