"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn, processStreamingResponse } from "@/lib/utils";
import { ChatHeader } from "@/components/ChatHeader";
import { PlusIcon, Send, Menu } from "lucide-react";
import Link from "next/link";
import Markdown from "react-markdown";
import { useChatStore } from "@/store/chat-store";
import { useCallback, useEffect } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { facade } from "@/lib/utils";
import { useSearchParams } from "next/navigation";

const ChatMessages = ({ messages }: { messages: { id: string; role: string; content: string }[] }) => {
  return (
    <div className="flex-1 overflow-auto p-4 space-y-4">
      {messages.map((message) => (
        <div key={message.id} className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}>
          <div
            className={cn("rounded-lg p-3 max-w-[80%]", {
              "bg-primary text-primary-foreground": message.role === "assistant",
              "bg-stone-800 text-primary-foreground": message.role === "user",
            })}
          >
            <Markdown className={cn("prose dark:prose-invert prose-p:leading-relaxed prose-pre:p-0")}>
              {message.content}
            </Markdown>
          </div>
        </div>
      ))}
    </div>
  );
};

const ChatInput = ({
  currentInput,
  setInput,
  isLoading,
  onSubmit,
}: {
  currentInput: string;
  setInput: (input: string) => void;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}) => {
  return (
    <form onSubmit={onSubmit} className="p-4 border-t border-primary/10">
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Message"
          value={currentInput}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
};

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
  } = useChatStore();

  useEffect(() => {
    if (sessionIdFromUrl) {
      setChatTitle(existingData.find((session) => session.id === sessionIdFromUrl)?.name || "New Chat");
    }
  }, [sessionIdFromUrl]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      // reject if no input or loading
      if (!currentInput.trim() || isLoading) return;

      const isFirstMessage = messages.length === 0;

      // Add user message
      addMessage(facade.humanMessage(currentInput));

      // Add empty AI message that will be streamed
      const aiMessage = facade.aiMessage("");
      addMessage(aiMessage);
      setLoading(true);
      setInput("");

      try {
        if (isFirstMessage) {
          const rawTitleData = await facade.updateSessionTitle(sessionId, messages);
          const data = await rawTitleData.json();
          console.log("data", data);
          setChatTitle(data.text);
        }

        const response = await facade.fetchAiMessage(
          currentInput,
          selectedModel.id,
          selectedModel.provider,
          messages,
          sessionId
        );

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
          (usage) => facade.postChatInfo(sessionId, aiMessage, currentInput, usage)
        );
      } catch (error) {
        console.error("Error:", error);
        updateLastMessage("Sorry, there was an error generating the response.");
      } finally {
        setLoading(false);
      }
    },
    [currentInput, isLoading, messages, selectedModel, sessionId]
  );

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
          <SidebarContent existingData={existingData} />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex col-span-3 border-r border-primary/10">
        <SidebarContent existingData={existingData} />
      </aside>

      <main className="col-span-12 lg:col-span-9 flex flex-col h-screen">
        <ChatHeader />
        <ChatMessages messages={messages} />
        <ChatInput currentInput={currentInput} setInput={setInput} isLoading={isLoading} onSubmit={handleSubmit} />
      </main>
    </div>
  );
};

const SidebarContent = ({
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
  return (
    <div className="flex h-full w-full flex-col gap-4 p-4">
      <Link href="/" className="font-title text-3xl font-bold text-primary">
        Wussup
      </Link>

      <Button variant="outline" className="w-full">
        <PlusIcon className="mr-2 h-4 w-4" />
        New Chat
      </Button>

      <div className="space-y-2">
        {existingData.map((session) => (
          <Link href={`/?session=${session.id}`} key={session.id} className="text-sm text-muted-foreground">
            {session.name || session.id}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ChatAppV3;
