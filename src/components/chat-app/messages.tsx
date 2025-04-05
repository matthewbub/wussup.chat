"use client";

import { cn } from "@/lib/utils";
import Markdown from "react-markdown";
import { NewMessage } from "@/store/chat-store";
import { useChatStore } from "@/store/chat-store";
import { LoadingDots } from "@/components/loading-dots";

export const ChatAppMessages = ({ messages }: { messages: NewMessage[] }) => {
  const { isLoading } = useChatStore();

  return (
    <div className="p-4 w-full mb-30">
      <ul className="space-y-4">
        {messages.map((message, index) => (
          <li key={index} className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}>
            <div
              className={cn("rounded-lg p-3 ", {
                "text-primary w-full": message.role === "assistant",
                "dark:bg-stone-800 bg-stone-200 text-stone-200 dark:text-stone-800 max-w-[80%]":
                  message.role === "user",
              })}
            >
              {message.content ? (
                <Markdown className={cn("prose dark:prose-invert prose-p:leading-relaxed prose-pre:p-0")}>
                  {message.content}
                </Markdown>
              ) : (
                // if were loading
                // and there is no message.content
                // and on the last message
                // and its not the user; its a new message
                isLoading && index === messages.length - 1 && message.role === "assistant" && <LoadingDots />
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
