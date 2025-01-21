"use client";

import React, { useState, useRef, useEffect } from "react";
import { useChatStore } from "@/stores/chatStore";
import MarkdownComponent from "@/components/ui/Markdown";
import { Message } from "@/types/chat";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export const ChatMessages: React.FC = () => {
  const { sessions, currentSessionId, isLoading, isStreaming } = useChatStore();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentSession = sessions.find(
    (session) => session.id === currentSessionId
  );
  const messages = currentSession?.messages || [];

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
    <>
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
    </>
  );
};
