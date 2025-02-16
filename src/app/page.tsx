"use client";

import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useChat } from "@ai-sdk/react";
import { useEffect, useState } from "react";
import { ChatLayout } from "@/components/DashboardLayout";
import { LanguageModalSelector } from "@/components/chat/LanguageModalSelector";
import { AVAILABLE_MODELS } from "@/constants/models";
import { Message } from "@/app/~/chat/_components/Message";
import { useChatStore } from "@/stores/chatStore";
import { useRouter } from "next/navigation";
import { EmptyChatScreen } from "@/components/EmptyChatScreen";

// Separate the chat UI into its own component
function ChatUI() {
  const defaultModel = AVAILABLE_MODELS[0];
  const [model, setModel] = useState(defaultModel.id);
  const { initGuest, user } = useChatStore();
  const router = useRouter();

  useEffect(() => {
    // load all the data into the app, account for the current session since we already have it
    initGuest();
  }, []);

  useEffect(() => {
    // if the user is logged in, send them to the chat page
    // if not; just let them do their thing
    if (user && user.user_id) {
      router.push(`/~/chat`);
    }
  }, [user]);

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
    api: "/api/v1/guest/temp-chat",
  });

  const componentSubmitHandler = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    handleSubmit(ev, {
      data: {
        user_specified_model: model,
      },
    });
    setInput("");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-87px)]">
      <div className="space-y-4 mb-6 flex-1 overflow-y-scroll p-4">
        {messages.length === 0 ? (
          <EmptyChatScreen setNewMessage={setInput} />
        ) : (
          messages.map((message, index) => (
            <Message key={index} message={message} />
          ))
        )}
      </div>

      <form
        onSubmit={componentSubmitHandler}
        className="flex flex-col gap-2 rounded-xl bg-secondary p-4"
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

            <Button type="submit" className="self-end w-fit">
              Send
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

// Wrap the main component with Suspense
function App() {
  return (
    <Suspense fallback={<div>Loading chat...</div>}>
      <ChatUI />
    </Suspense>
  );
}

// Move ChatLayout inside Suspense
export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChatLayout>
        <App />
      </ChatLayout>
    </Suspense>
  );
}
