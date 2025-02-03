"use client";

import React, { useState, useRef } from "react";
import { useChatStore } from "@/stores/chatStore";
import { ModelSelect } from "./ModelSelect";
import { useSubscriptionStore } from "@/stores/useSubscription";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";

export const ChatUserInput: React.FC = () => {
  const { currentSessionId, addMessage, addSession, isLoadingMessageResponse } =
    useChatStore();
  const { user } = useAuthStore();
  const router = useRouter();

  const [newMessage, setNewMessage] = useState("");
  const [model, setModel] = useState("gpt-4-turbo-2024-04-09");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { subscription } = useSubscriptionStore();

  const handleAddMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    // if no message or if loading in the current chat response, just return..
    if (!newMessage.trim() || isLoadingMessageResponse) return;

    if (!currentSessionId && user?.id) {
      // Create new session if none exists
      const sessionId = await addSession(user.id);
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
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  return (
    <>
      <Separator />
      <form onSubmit={handleAddMessage} className="bg-background">
        <div className="flex items-end space-x-2 p-4">
          <div className="flex flex-col w-full gap-2 h-full">
            <div className="flex items-center space-x-2">
              <ModelSelect
                model={model}
                onModelChange={setModel}
                isSubscribed={subscription.isSubscribed}
              />
            </div>
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
          <Button type="submit" disabled={isLoadingMessageResponse}>
            Send
          </Button>
        </div>
      </form>
    </>
  );
};
