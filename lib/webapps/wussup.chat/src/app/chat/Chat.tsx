"use client";

import { useChatStore } from "@/stores/chatStore";
import { ChatUserInput } from "./ChatUserInput";
import { ChatMessages } from "./ChatMessages";

export const Chat: React.FC = () => {
  const { currentSessionId } = useChatStore();

  return (
    <div className="flex flex-col h-[calc(100vh-100px)]">
      {currentSessionId ? (
        <ChatMessages />
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-slate-800 dark:text-slate-200">
            Type a message to start a new chat
          </p>
        </div>
      )}
      <ChatUserInput />
    </div>
  );
};
