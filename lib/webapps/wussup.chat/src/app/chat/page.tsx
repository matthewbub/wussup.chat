"use client";

import { useChatStore } from "@/stores/chatStore";
import { DashboardLayout } from "@/components/system/DashboardLayout";
import { ChatUserInput } from "./ChatUserInput";
import { ChatMessages } from "./ChatMessages";

const Chat: React.FC = () => {
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

export default function Page() {
  const { sessionTitle, currentSessionId } = useChatStore();
  return (
    <DashboardLayout
      activePage="chat"
      breadcrumbItems={[
        { label: "Chat", href: "/chat" },
        { label: sessionTitle, href: `/chat?session=${currentSessionId}` },
      ]}
    >
      <Chat />
    </DashboardLayout>
  );
}
