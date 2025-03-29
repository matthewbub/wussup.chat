"use client";

import { processStreamingResponse } from "@/lib/utils";
import { NewMessage, useChatStore } from "@/store/chat-store";
import { useEffect } from "react";
import { facade } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { ChatAppMessages } from "./_ChatAppMessages";
import { ChatAppInput } from "./_ChatAppInput";
import { ChatAppHeader } from "./_ChatAppHeader";
import { ChatAppMobileSidebarV2 } from "./_ChatAppMobileSidebarV2";
import * as Sentry from "@sentry/nextjs";
import { ChatAppSidebarV2 } from "./_ChatAppSidebarV2";
const ChatAppV3 = ({
  existingData,
}: {
  existingData: {
    id: string;
    name: string;
    created_at: string;
    updated_at: string;
    chat_history: { role: string; content: string }[];
  }[];
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

    setLoading(true);

    try {
      // Check quota first before adding any messages
      const quotaCheck = await facade.fetchAiMessage({
        input: currentInput,
        model: selectedModel.id,
        provider: selectedModel.provider,
        messages,
        sessionId,
        checkOnly: true,
      });

      if (!quotaCheck.ok) {
        const errorData = await quotaCheck.json();
        if (quotaCheck.status === 429) {
          // Add user message and error message to chat
          addMessage(facade.humanMessage(currentInput));
          addMessage(
            facade.aiMessage(
              errorData.message || "You have reached your message limit. Please try again later or upgrade your plan."
            )
          );
          throw new Error(errorData.message);
        }
        throw new Error("Failed to check message quota");
      }

      const isFirstMessage = messages.length === 0;

      // Add user message
      addMessage(facade.humanMessage(currentInput));

      // Add empty AI message that will be streamed
      const aiMessage = facade.aiMessage("");
      addMessage(aiMessage);
      setInput("");

      // Only proceed with title and message generation if quota check passes
      if (isFirstMessage) {
        const rawTitleData = await facade.updateSessionTitle(sessionId, currentInput);
        const data = await rawTitleData.json();
        setChatTitle(data.text);
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
        (content) => {
          aiMessage.content += content;
          updateLastMessage(aiMessage.content);
        },
        // Handle metadata (usage info) when stream completes
        (usage) =>
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
        updateLastMessage("Sorry, there was an error generating the response.");
      }
    } finally {
      setLoading(false);
    }
  };

  console.log("existingData", existingData);

  return (
    <div className="flex h-screen">
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
        />
      </main>
    </div>
  );
};

export default ChatAppV3;
