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
import { useSearchParams } from "next/navigation";

const ForceAuth = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useChatStore();
  const { openAuth } = useNavUserStore();

  useEffect(() => {
    if (!user && !loading) {
      openAuth();
      return;
    }
  }, [user, loading]);

  return children;
};

function App() {
  const searchParams = useSearchParams();
  const initialSession = searchParams.get("session");

  const defaultModel = AVAILABLE_MODELS[0];
  const [model, setModel] = useState(defaultModel.id);
  const { init, user, currentSession, updateCurrentSession } = useChatStore();

  const [loadingInitialMessages, setLoadingInitialMessages] = useState(true);
  const [initialMessages, setInitialMessages] = useState<AiMessage[]>([]);

  useEffect(() => {
    // load all the data into the app, account for the current session since we already have it
    init(initialSession as string);
  }, []);

  useEffect(() => {
    if (currentSession) {
      setInitialMessages(
        currentSession.messages.map((message) => ({
          role: message.is_user ? "user" : "assistant",
          content: message.content,
          id: message.id,
        }))
      );
    }
    setLoadingInitialMessages(false);
  }, [currentSession]);

  // update chat session if the URL changes
  useEffect(() => {
    const sessionFromUrl = searchParams.get("session");
    console.log("[Session Updated] ", sessionFromUrl);
    if (sessionFromUrl) {
      updateCurrentSession(sessionFromUrl);
    }
  }, [searchParams]);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    status,
    stop,
    error,
    reload,
    setInput,
  } = useChat({
    api: "/api/v1/chat",
    initialMessages: initialMessages as AiMessage[] | undefined,
    onFinish: async (message, { usage, finishReason }) => {
      const sessionId = searchParams.get("session");
      console.log("Finished streaming message:", message);
      console.log("Token usage:", usage);
      console.log("Finish reason:", finishReason);

      // Shoudln't this be on the server to begin w
      const response = await fetch("/api/v1/info", {
        method: "POST",
        body: JSON.stringify({
          created_at: message.createdAt,
          content: message.content,
          role: message.role,
          message_id: message.id,
          session_id: sessionId,
          prompt_tokens: usage?.promptTokens,
          completion_tokens: usage?.completionTokens,
          total_tokens: usage?.totalTokens,
        }),
      });
      const data = await response.json();
      console.log("Response:", data);
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

  const componentSubmitHandler = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    console.log("Current session id", currentSession?.id);
    handleSubmit(ev, {
      // @ts-expect-error - idk wussup this is valid stuff
      data: {
        session_id: searchParams.get("session"),
        session_title: currentSession?.name,
      },
    });
    setInput("");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)]">
      <div className="space-y-4 mb-6 flex-1 overflow-y-scroll p-4">
        {messages.map((message, index) => (
          <Message key={index} message={message} />
        ))}
      </div>

      <form
        onSubmit={componentSubmitHandler}
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
  );
}

export default function Page() {
  return (
    <ForceAuth>
      <ChatLayout>
        <App />
      </ChatLayout>
    </ForceAuth>
  );
}
