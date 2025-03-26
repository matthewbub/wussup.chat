"use client";

import { cn } from "@/lib/utils";
import Markdown from "react-markdown";
import { NewMessage } from "@/store/chat-store";

export const ChatAppMessages = ({ messages }: { messages: NewMessage[] }) => {
  return (
    <div className="flex-1 overflow-auto p-4 space-y-4">
      {messages.map((message, index) => (
        <div key={index} className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}>
          <div
            className={cn("rounded-lg p-3 ", {
              "text-primary w-full": message.role === "assistant",
              "dark:bg-stone-800 bg-stone-200 text-stone-200 dark:text-stone-800 max-w-[80%]": message.role === "user",
            })}
          >
            <Markdown className={cn("prose dark:prose-invert prose-p:leading-relaxed prose-pre:p-0")}>
              {message.content}
            </Markdown>
          </div>
        </div>
      ))}
    </div>
  );
};
