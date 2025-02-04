"use client";

import React, { useState, useRef } from "react";
import { useChatStore } from "@/stores/chatStore";
import { LanguageModalSelector } from "./LanguageModalSelector";
import { useSubscriptionStore } from "@/stores/useSubscription";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

import { useRouter } from "next/navigation";

export const ChatUserInput: React.FC = () => {
  const {
    currentSessionId,
    addMessage,
    addSession,
    isLoadingMessageResponse,
    newMessage,
    setNewMessage,
  } = useChatStore();

  const router = useRouter();

  const [model, setModel] = useState("gpt-4-turbo-2024-04-09");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { subscription } = useSubscriptionStore();

  const handleAddMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("newMessage", newMessage);

    // if no message or if loading in the current chat response, just return..
    if (!newMessage.trim() || isLoadingMessageResponse) return;

    console.log("currentSessionId", currentSessionId);

    if (!currentSessionId) {
      // Create new session if none exists
      const sessionId = await addSession();
      if (sessionId) {
        router.push(`/chat?session=${sessionId}`);
        // Add message after session is created
        addMessage(newMessage, model);
        setNewMessage("");
      }
    } else if (currentSessionId) {
      // Normal flow when session exists
      addMessage(newMessage, model);
      setNewMessage("");
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);

    // First set a small height to properly calculate scrollHeight
    e.target.style.height = "0px";
    const scrollHeight = e.target.scrollHeight;

    // Set the new height
    e.target.style.height = `${scrollHeight}px`;
  };

  return (
    <div className="mt-auto">
      <Separator />
      <form onSubmit={handleAddMessage} className="bg-background">
        <div className="flex items-end space-x-2 p-4">
          <div className="flex flex-col w-full gap-2">
            <div className="flex items-center space-x-2">
              <LanguageModalSelector
                model={model}
                onModelChange={setModel}
                isSubscribed={subscription.isSubscribed}
              />
            </div>
            <div className="relative">
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
                className="flex-1 min-h-[48px] max-h-[200px] text-sm resize-none overflow-y-hidden"
                style={{ height: "auto" }}
              />
            </div>
          </div>
          <Button type="submit" disabled={isLoadingMessageResponse}>
            Send
          </Button>
        </div>
      </form>
    </div>
  );
};
