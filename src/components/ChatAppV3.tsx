"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn, processStreamingResponse } from "@/lib/utils";
import { ChatHeader } from "@/components/ChatHeader";
import { PlusIcon, Send, Menu } from "lucide-react";
import Link from "next/link";
import Markdown from "react-markdown";
import { NewMessage, useChatStore } from "@/store/chat-store";
import { useEffect } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { facade } from "@/lib/utils";
import { useSearchParams } from "next/navigation";

const ChatMessages = ({ messages }: { messages: NewMessage[] }) => {
  return (
    <div className="flex-1 overflow-auto p-4 space-y-4">
      {messages.map((message, index) => (
        <div key={index} className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}>
          <div
            className={cn("rounded-lg p-3 max-w-[80%]", {
              "bg-primary text-primary": message.role === "assistant",
              "bg-stone-800 text-primary": message.role === "user",
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
    setSessionId,
    setMessages,
  } = useChatStore();

  useEffect(() => {
    if (sessionIdFromUrl) {
      setChatTitle(existingData.find((session) => session.id === sessionIdFromUrl)?.name || "New Chat");
      setSessionId(sessionIdFromUrl);

      const chatHistory = existingData.find((session) => session.id === sessionIdFromUrl)?.chat_history || [];
      setMessages(chatHistory as NewMessage[]);
    }
  }, [sessionIdFromUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
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
    } catch (error) {
      console.error("Error:", error);
      updateLastMessage("Sorry, there was an error generating the response.");
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
          <SidebarContent existingData={existingData} sessionId={sessionId} />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex col-span-3 border-r border-primary/10">
        <SidebarContent existingData={existingData} sessionId={sessionId} />
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
  sessionId,
}: {
  existingData: {
    id: string;
    name: string;
    created_at: string;
    updated_at: string;
    chat_history: { role: string; content: string }[];
  }[];
  sessionId: string;
}) => {
  return (
    <div className="flex h-full w-full flex-col bg-gradient-to-b from-background to-background/95">
      <div className="p-6 border-b border-primary/5">
        <Link href="/" className="font-title text-3xl font-bold text-primary hover:opacity-80 transition-opacity">
          Wussup
        </Link>
      </div>

      <div className="p-4">
        <Button
          variant="outline"
          className="w-full group transition-all hover:bg-primary hover:text-primary-foreground"
        >
          <PlusIcon className="h-4 w-4 mr-2 group-hover:text-primary-foreground" />
          New Chat
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-3 font-medium">
          Recent Conversations
        </h2>
        <div className="space-y-1">
          {existingData.map((session) => (
            <Link
              href={`/?session=${session.id}`}
              key={session.id}
              className={cn(
                "block py-2 px-3 rounded-md text-sm text-foreground/80 hover:bg-primary/5 hover:text-primary transition-colors truncate",
                {
                  "bg-primary/5 text-primary": session.id === sessionId,
                }
              )}
            >
              {session.name || session.id}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatAppV3;
