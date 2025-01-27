"use client";

import { useChatStore } from "@/stores/chatStore";
import { ChatUserInput } from "./ChatUserInput";
import { ChatMessages } from "./ChatMessages";

export const Chat: React.FC = () => {
  const { currentSessionId } = useChatStore();

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
    <div className="flex flex-col h-[calc(100vh-100px)]">
      <ChatMessages />
      <ChatUserInput />
    </div>
  );
};
