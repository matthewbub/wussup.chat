"use client";

import React, { useState, useRef, useEffect } from "react";
import { useChatStore } from "@/stores/chatStore";
import MarkdownComponent from "@/components/ui/Markdown";
import { ModelSelect } from "./ModelSelect";
import { useSubscriptionStore } from "@/stores/useSubscription";
import { Message } from "@/types/chat";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export const Chat: React.FC = () => {
  const {
    sessions,
    currentSessionId,
    addMessage,
    sessionTitle,
    isLoading,
    isStreaming,
  } = useChatStore();
  const { toast } = useToast();
  const [newMessage, setNewMessage] = useState("");
  const [model, setModel] = useState("gpt-4-turbo-2024-04-09");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentSession = sessions.find(
    (session) => session.id === currentSessionId
  );
  const messages = currentSession?.messages || [];
  const { subscription } = useSubscriptionStore();

  // Track if user manually scrolled during streaming
  const [userScrolledDuringStream, setUserScrolledDuringStream] =
    useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    const container = chatContainerRef.current;
    if (container) {
      const isBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight <
        30;
      setIsAtBottom(isBottom);

      // If we're streaming and the user scrolls away from bottom,
      // mark that they've manually scrolled
      if (isStreaming && !isBottom) {
        setUserScrolledDuringStream(true);
      }
    }
  };

  // Reset user scroll override when starting a new stream
  useEffect(() => {
    if (isStreaming) {
      setUserScrolledDuringStream(false);
    }
  }, [isStreaming]);

  // Scroll only when streaming completes and user hasn't manually scrolled
  useEffect(() => {
    if (
      !isStreaming &&
      !isLoading &&
      messages.length > 0 &&
      !userScrolledDuringStream
    ) {
      scrollToBottom("smooth");
    }
  }, [messages, isStreaming, isLoading, userScrolledDuringStream]);

  // Show toast when streaming completes if user scrolled away
  useEffect(() => {
    if (!isStreaming && !isLoading && userScrolledDuringStream) {
      toast({
        title: "Response Complete",
        description:
          "The AI has finished responding. Scroll down to view the full message.",
        duration: 4000,
      });
    }
  }, [isStreaming, isLoading, userScrolledDuringStream, toast]);

  // Scroll handling utilities
  const scrollToBottom = (behavior: ScrollBehavior = "auto") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Scroll on initial load and session change
  useEffect(() => {
    if (currentSessionId) {
      scrollToBottom();
    }
  }, [currentSessionId]);

  const handleAddMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && currentSessionId) {
      addMessage(newMessage, model);
      setNewMessage("");
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  if (!currentSessionId) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-slate-800 dark:text-slate-200">
          Select or create a chat to start messaging
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-100px)]">
      {sessionTitle && (
        <div className="flex items-center justify-between px pb-4 bg-background">
          <h1 className="text-2xl font-bold">{sessionTitle}</h1>
        </div>
      )}
      <div
        ref={chatContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.map((message: Message) => (
          <div
            key={message.id}
            className={`flex ${
              message.is_user ? "justify-end" : "justify-start"
            }`}
          >
            <div className="flex flex-col">
              <div
                className={`max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl rounded-lg p-3 ${
                  message.is_user
                    ? "bg-blue-700 text-white"
                    : "bg-slate-700 text-slate-200"
                }`}
              >
                <MarkdownComponent>{message.content}</MarkdownComponent>
              </div>
              <div
                className={
                  "text-xs text-slate-500 " +
                  (message.is_user ? "text-right" : "text-left")
                }
              >
                <p className="text-xs text-slate-500 pt-2 pl-1">
                  {new Date(message.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Show scroll to bottom button when not at bottom */}
      {!isAtBottom && (
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-24 right-8 rounded-full"
          onClick={() => scrollToBottom("smooth")}
        >
          ↓
        </Button>
      )}

      <Separator />
      <form onSubmit={handleAddMessage} className="bg-background">
        <div className="flex items-end space-x-2 p-4">
          <div className="flex flex-col w-full gap-2 h-full">
            <ModelSelect
              model={model}
              onModelChange={setModel}
              isSubscribed={subscription.isSubscribed}
            />
            <Textarea
              ref={textareaRef}
              value={newMessage}
              onChange={handleTextareaChange}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleAddMessage(e);
                }
              }}
              rows={1}
              placeholder="Type a message..."
              className="flex-1 min-h-[48px] max-h-[200px] text-sm"
            />
          </div>
          <Button type="submit">Send</Button>
        </div>
      </form>
    </div>
  );
};
