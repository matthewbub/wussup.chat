"use client";

import React, { useState, useRef } from "react";
import { useChatStore } from "@/stores/chatStore";
import { LanguageModalSelector } from "./LanguageModalSelector";
import { useSubscriptionStore } from "@/stores/useSubscription";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

import { useRouter } from "next/navigation";
import { AVAILABLE_MODELS } from "@/constants/models";
import { useToast } from "@/hooks/use-toast";

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

  const defaultModel = AVAILABLE_MODELS[0];
  const [model, setModel] = useState(defaultModel.id);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { subscription } = useSubscriptionStore();
  const { toast } = useToast();

  const handleAddMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    // if no message or if loading in the current chat response, just return..
    if (!newMessage.trim() || isLoadingMessageResponse) return;

    try {
      if (!currentSessionId) {
        // Create new session if none exists
        const sessionId = await addSession();
        if (sessionId) {
          router.push(`/?session=${sessionId}`);
          // Add message after session is created
          await addMessage(newMessage, model);
          setNewMessage("");
        }
      } else if (currentSessionId) {
        // Normal flow when session exists
        await addMessage(newMessage, model);
        setNewMessage("");
      }
      // @eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      // Handle moderation error
      if (error?.message?.includes("Content flagged")) {
        const categories = error.categories?.join(", ");
        toast({
          title: "Message Blocked",
          description: `This message was flagged for potentially harmful content${categories ? `: ${categories}` : ""}. Please revise and try again.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to send message. Please try again.",
          variant: "destructive",
        });
      }
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
          <div className="flex flex-col-reverse w-full gap-2">
            <div className="flex items-center space-x-2">
              {/* <ModelSelector plan="PRO" /> */}
              <LanguageModalSelector
                model={model}
                onModelChange={setModel}
                isSubscribed={subscription.isSubscribed}
              />
            </div>
            <div className="relative flex items-center gap-2">
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
                className="flex-1 min-h-[48px] max-h-[200px] text-sm resize-none overflow-y-hidden bg-background border-none"
                style={{ height: "auto" }}
              />
              <Button type="submit" disabled={isLoadingMessageResponse}>
                Send
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
