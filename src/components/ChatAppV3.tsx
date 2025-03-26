"use client";

import { Button } from "@/components/ui/button";
import { processStreamingResponse } from "@/lib/utils";
import { Menu } from "lucide-react";
import { NewMessage, useChatStore } from "@/store/chat-store";
import { useEffect } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { facade } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { ChatAppSidebar } from "./_ChatAppSidebar";
import { ChatAppMessages } from "./_ChatAppMessages";
import { ChatAppInput } from "./_ChatAppInput";
import { ChatAppHeader } from "./_ChatAppHeader";

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
    } catch (error: any) {
      console.error("Error:", error);
      // Don't override quota error messages
      if (!error.message?.includes("limit")) {
        updateLastMessage("Sorry, there was an error generating the response.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-12 bg-background h-screen">
      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild className="lg:hidden absolute left-4 top-4">
          <Button variant="outline" size="icon">
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] p-0">
          <ChatAppSidebar existingData={chatSessions} sessionId={sessionId} />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex col-span-3 border-r border-primary/10">
        <ChatAppSidebar existingData={chatSessions} sessionId={sessionId} />
      </aside>

      <main className="col-span-12 lg:col-span-9 flex flex-col h-screen sticky top-0">
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
