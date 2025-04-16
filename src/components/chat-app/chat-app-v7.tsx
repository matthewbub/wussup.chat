"use client";
import * as Sentry from "@sentry/nextjs";
import { Message, useChat } from "@ai-sdk/react";
import { ChatAppInput } from "@/components/chat-app/input";
import { ChatAppSidebar } from "@/components/chat-app/sidebar";
import { ChatAppMobileSidebar } from "@/components/chat-app/mobile-sidebar";
import { useChatStore } from "@/store/chat-store";
import { IconSidebar } from "@/components/sidebar";
import { cn } from "@/lib/utils";
import MarkdownComponent from "@/components/ui/Markdown";
import { LoadingDots } from "@/components/loading-dots";

const ChatAppV7 = ({ initialMessages = [] }: { initialMessages: Message[] | [] }) => {
  const { isLoading, selectedModel, sessionId, setLoading, updateSessionTitle, setModel } = useChatStore();

  const { messages, input, handleInputChange, handleSubmit, status } = useChat({
    api: "/api/messages/ai-v7",
    body: {
      model: selectedModel.id,
      sessionId,
    },
    initialMessages,
    onFinish: (message, options) => {
      console.log("message", message);
      console.log("options", options);
      setLoading(false);
    },
    onError: (error) => {
      console.error("error", error);
      setLoading(false);
    },
    onResponse: (response) => {
      console.log("response", response);
    },
  });

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const inputValue = formData.get("message");

    const isFirstMessage = (messages && messages.length === 0) || messages === null;
    // gen title if first message
    if (isFirstMessage) {
      // run void fetch to move things alogn quicker
      void fetch("/api/threads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ threadId: sessionId, generateNameFromContent: inputValue }),
      })
        .then((response) => response.json())
        .then((newThread) => {
          if (newThread.data.name) {
            updateSessionTitle(sessionId, newThread.data.name);
          }
        })
        .catch((error) => {
          Sentry.captureException(error);
        });
    }

    handleSubmit();
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* App navigation */}
      <IconSidebar />

      {/* Desktop Sidebar */}
      <div className="hidden md:block relative w-72">
        <div className="absolute inset-0 border-r border-border">
          <ChatAppSidebar sessionId={sessionId} />
        </div>
      </div>

      {/* Mobile Sidebar */}
      <ChatAppMobileSidebar sessionId={sessionId} />

      <main className="flex-1 flex flex-col min-w-0 relative">
        <div className="flex flex-col w-full">
          <ul className="px-8 mt-12 pb-24">
            {messages.map((message) => (
              <li key={message.id} className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}>
                <div
                  className={cn("rounded-lg p-3", {
                    "text-primary w-full": message.role === "assistant",
                    "dark:bg-stone-800 bg-stone-200 text-stone-200 dark:text-stone-800 max-w-[80%]":
                      message.role === "user",
                  })}
                >
                  {message.content ? (
                    <MarkdownComponent className={cn("prose dark:prose-invert prose-p:leading-relaxed prose-pre:p-0")}>
                      {message.content}
                    </MarkdownComponent>
                  ) : message.parts ? (
                    <div>
                      {message.parts.map((part, i) => {
                        switch (part.type) {
                          case "text":
                            return <p key={i}>{part.text}</p>;
                          case "source":
                            return <p key={i}>{part.source.url}</p>;
                          case "reasoning":
                            return <div key={i}>{part.reasoning}</div>;
                          case "tool-invocation":
                            return <div key={i}>{part.toolInvocation.toolName}</div>;
                          case "file":
                            return <img key={i} src={`data:${part.mimeType};base64,${part.data}`} alt="file" />;
                          default:
                            return null;
                        }
                      })}
                    </div>
                  ) : status === "streaming" ? (
                    <LoadingDots />
                  ) : null}
                </div>
              </li>
            ))}
          </ul>

          <ChatAppInput
            currentInput={input}
            setInput={handleInputChange}
            isLoading={isLoading}
            onSubmit={handleChatSubmit}
            selectedModel={selectedModel}
            onModelChange={setModel}
          />
        </div>
      </main>
    </div>
  );
};

export default ChatAppV7;
