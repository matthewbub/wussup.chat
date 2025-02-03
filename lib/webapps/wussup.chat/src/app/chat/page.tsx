"use client";

import { useChatStore } from "@/stores/chatStore";
import { DashboardLayout } from "@/components/system/DashboardLayout";
import { ChatUserInput } from "./ChatUserInput";
import { ChatMessages } from "./ChatMessages";

const Chat: React.FC = () => {
  const { currentSessionId, setNewMessage } = useChatStore();

  return (
    <div className="flex flex-col h-[calc(100vh-100px)]">
      {currentSessionId ? (
        <ChatMessages />
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-2xl w-full p-8">
            <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mb-6 text-center">
              Start a New Conversation
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                "Tell me about your day",
                "Help me solve a problem",
                "Let's brainstorm ideas",
                "I need writing assistance",
              ].map((prompt) => (
                <button
                  key={prompt}
                  className="px-4 py-2 text-center rounded-full border border-slate-200 dark:border-slate-700 
                           hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors
                           text-slate-700 dark:text-slate-300"
                  onClick={() => {
                    setNewMessage(prompt);
                  }}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
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
