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
  const { currentSessionId, addMessage, addSession } = useChatStore();
  const { user } = useAuthStore();
  const router = useRouter();

  const [newMessage, setNewMessage] = useState("");
  const [model, setModel] = useState("gpt-4-turbo-2024-04-09");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { subscription } = useSubscriptionStore();

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

  const handleNewChat = async () => {
    if (user?.id) {
      const sessionId = await addSession(user.id);
      if (sessionId) {
        router.push(`/chat?session=${sessionId}`);
      }
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
              <Button onClick={handleNewChat} type="button">
                New Chat
              </Button>
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
          <Button type="submit">Send</Button>
        </div>
      </form>
    </>
  );
};
