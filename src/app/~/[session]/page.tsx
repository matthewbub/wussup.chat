"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useChat, Message as AiMessage } from "@ai-sdk/react";
import { useEffect, useState } from "react";
import { ChatLayout } from "@/components/DashboardLayout";
import { LanguageModalSelector } from "@/components/chat/LanguageModalSelector";
import { AVAILABLE_MODELS } from "@/constants/models";
import { Message } from "./_components/Message";
import useNavUserStore from "@/stores/useNavUserStore";
import { useChatStore } from "@/stores/chatStore";
import { useParams } from "next/navigation";

export default function Home() {
  const { session } = useParams();
  const defaultModel = AVAILABLE_MODELS[0];
  const [model, setModel] = useState(defaultModel.id);
  const { init, user, currentSession } = useChatStore();
  const { openAuth } = useNavUserStore();

  const [loadingInitialMessages, setLoadingInitialMessages] = useState(true);
  const [initialMessages, setInitialMessages] = useState<AiMessage[]>([]);

  useEffect(() => {
    // init app &&
    // fetch session, if there is a session that actually exisits with the id,
    init(session as string);
  }, []);

  useEffect(() => {
    console.log("currentSession", currentSession?.messages);
    if (currentSession) {
      setInitialMessages(
        currentSession.messages.map((message) => ({
          role: message.is_user ? "user" : "assistant",
          content: message.content,
          id: message.id,
        }))
      );
      setLoadingInitialMessages(false);
    }
  }, [currentSession]);

  if (!user) {
    // force auth modal to stay open til user is logged in
    openAuth();
    return null;
  }

  console.log("initialMessages", initialMessages, currentSession);

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
    initialMessages: initialMessages as AiMessage[] | undefined,
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
              isSubscribed={user?.subscriptionStatus === "active"}
            />
            <div className="flex gap-2">
              {(status === "submitted" || status === "streaming") && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => stop()}
                  className="animate-pulse"
                  disabled={!(status === "streaming" || status === "submitted")}
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

              <Button
                type="submit"
                className="self-end w-fit"
                disabled={loadingInitialMessages}
              >
                Send
              </Button>
            </div>
          </div>
        </form>
      </div>
    </ChatLayout>
  );
}
