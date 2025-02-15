"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useChat } from "@ai-sdk/react";
import { useEffect, useState } from "react";
import { ChatLayout } from "@/components/DashboardLayout";
import { LanguageModalSelector } from "@/components/chat/LanguageModalSelector";
import { AVAILABLE_MODELS } from "@/constants/models";
import { useSubscriptionStore } from "@/stores/useSubscription";
import { Message } from "./_components/Message";
import useNavUserStore from "@/stores/useNavUserStore";
import { useChatStore } from "@/stores/chatStore";

function Lifecycle({ children }: { children: React.ReactNode }) {
  const { setUserId, fetchSessions } = useChatStore();
  const { openAuth } = useNavUserStore();

  useEffect(() => {
    async function init() {
      const response = await fetch("/api/chat");
      const data = await response.json();
      const user = data.user;
      if (!user) {
        // force auth modal to stay open til user is logged in
        openAuth();
        return;
      }
      setUserId(user.id);
    }
    init();
  }, []);

  useEffect(() => {
    fetchSessions();
  }, []);

  return children;
}

export default function Home() {
  const defaultModel = AVAILABLE_MODELS[0];
  const [model, setModel] = useState(defaultModel.id);
  const { subscription } = useSubscriptionStore();
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    status,
    stop,
    error,
    reload,
  } = useChat({
    api: "/api/v1/chat",
    onFinish: (message, { usage, finishReason }) => {
      console.log("Finished streaming message:", message);
      console.log("Token usage:", usage);
      console.log("Finish reason:", finishReason);
    },
    onError: (error) => {
      console.error("An error occurred:", error);
    },
    onResponse: (response) => {
      // It's worth noting that you can abort the processing by throwing an error in the onResponse callback.
      // This will trigger the onError callback and stop the message from being appended to the chat UI.
      // This can be useful for handling unexpected responses from the AI provider.
      console.log("Received HTTP response from server:", response);
    },
  });

  return (
    <Lifecycle>
      <ChatLayout>
        <div className="flex flex-col h-[calc(100vh-100px)]">
          <div className="space-y-4 mb-6 flex-1 overflow-y-scroll p-4">
            {messages.map((message, index) => (
              <Message key={index} message={message} />
            ))}
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-2 rounded-lg bg-secondary p-4"
          >
            <Textarea
              value={input}
              onChange={handleInputChange}
              placeholder="Type your message..."
            />

            <div className="flex justify-between gap-2">
              <LanguageModalSelector
                model={model}
                onModelChange={setModel}
                isSubscribed={subscription.isSubscribed}
              />
              <div className="flex gap-2">
                {(status === "submitted" || status === "streaming") && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => stop()}
                    className="animate-pulse"
                    disabled={
                      !(status === "streaming" || status === "submitted")
                    }
                  >
                    Stop
                  </Button>
                )}

                {error && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => reload()}
                    disabled={!(status === "ready" || status === "error")}
                  >
                    Retry
                  </Button>
                )}

                <Button type="submit" className="self-end w-fit">
                  Send
                </Button>
              </div>
            </div>
          </form>
        </div>
      </ChatLayout>
    </Lifecycle>
  );
}
