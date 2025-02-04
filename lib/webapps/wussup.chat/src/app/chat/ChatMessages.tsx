"use client";

import React, { useState, useRef, useEffect } from "react";
import { useChatStore } from "@/stores/chatStore";
import MarkdownComponent from "@/components/ui/Markdown";
import { Message } from "@/types/chat";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Copy, MoreHorizontal, GitFork, Volume2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import clsx from "clsx";

export const ChatMessages: React.FC = () => {
  const {
    sessions,
    currentSessionId,
    isLoadingMessageResponse,
    isStreaming,
    generateSpeech,
    forkChat,
  } = useChatStore();
  const router = useRouter();
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
  const [isPlaying, setIsPlaying] = useState<string | null>(null);

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
      !isLoadingMessageResponse &&
      messages.length > 0 &&
      !userScrolledDuringStream
    ) {
      scrollToBottom("smooth");
    }
  }, [
    messages,
    isStreaming,
    isLoadingMessageResponse,
    userScrolledDuringStream,
  ]);

  // Show toast when streaming completes if user scrolled away
  useEffect(() => {
    if (!isStreaming && !isLoadingMessageResponse && userScrolledDuringStream) {
      toast({
        title: "Response Complete",
        description:
          "The AI has finished responding. Scroll down to view the full message.",
        duration: 4000,
      });
    }
  }, [isStreaming, isLoadingMessageResponse, userScrolledDuringStream, toast]);

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

  const handleForkChat = async (messageId: string) => {
    // Find all messages up to and including the selected message
    const messageIndex = messages.findIndex((m) => m.id === messageId);
    const messagesUpToFork = messages.slice(0, messageIndex + 1);

    // Create new session with forked messages
    const newSessionId = await forkChat(messagesUpToFork);
    if (newSessionId) {
      router.push(`/chat?session=${newSessionId}`);
    } else {
      toast({
        title: "Error",
        description: "Failed to fork chat. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReadAloud = async (messageId: string, content: string) => {
    try {
      setIsPlaying(messageId);
      const base64Audio = await generateSpeech(content);
      const audio = new Audio(`data:audio/mp3;base64,${base64Audio}`);

      audio.onended = () => {
        setIsPlaying(null);
      };

      await audio.play();
    } catch (error) {
      console.error("Error playing audio:", error);
      setIsPlaying(null);
    }
  };

  const handleCopyMessage = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Copied",
        description: "Message copied to clipboard",
        duration: 2000,
      });
    } catch (error) {
      console.error("Failed to copy message:", error);
      toast({
        title: "Error",
        description: "Failed to copy message",
        variant: "destructive",
      });
    }
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
            <div className="flex flex-col relative group">
              <div className="absolute top-2 right-2">
                <DropdownMenu>
                  <DropdownMenuTrigger className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-slate-400"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => handleForkChat(message.id)}
                    >
                      <GitFork className="mr-2 h-4 w-4" />
                      <span>Fork Chat from Here</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleCopyMessage(message.content)}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      <span>Copy Message</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        handleReadAloud(message.id, message.content)
                      }
                      disabled={isPlaying === message.id}
                    >
                      {isPlaying === message.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Volume2 className="mr-2 h-4 w-4" />
                      )}
                      <span>
                        {isPlaying === message.id ? "Playing..." : "Read Aloud"}
                      </span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div
                className={`max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl rounded-lg p-2 pr-10 ${
                  message.is_user
                    ? "bg-blue-500 dark:bg-blue-700 text-white dark:text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-black dark:text-gray-200"
                }`}
              >
                {!message.is_user &&
                isStreaming &&
                message === messages[messages.length - 1] ? (
                  <div
                    className={clsx({ "flex items-center": !message.content })}
                  >
                    {!message.content && (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    )}
                    <MarkdownComponent>{message.content}</MarkdownComponent>
                  </div>
                ) : (
                  <MarkdownComponent>{message.content}</MarkdownComponent>
                )}
              </div>
              <div
                className={
                  "text-xs text-gray-600 dark:text-gray-400 " +
                  (message.is_user ? "text-right" : "text-left")
                }
              >
                <p className="text-xs text-gray-600 dark:text-gray-400 pt-2 pl-1">
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
