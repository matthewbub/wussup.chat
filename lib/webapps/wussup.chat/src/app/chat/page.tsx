"use client";

import { useChatStore } from "@/stores/chatStore";
import { DashboardLayout } from "@/components/system/DashboardLayout";
import { ChatUserInput } from "./ChatUserInput";
import { ChatMessages } from "./ChatMessages";
import { useEffect } from "react";
import { createClient } from "@/lib/supabase-client";

const Chat: React.FC = () => {
  const { currentSessionId, setNewMessage } = useChatStore();

  return (
    <div className="flex flex-col h-[calc(100vh-100px)]">
      {currentSessionId ? (
        <ChatMessages />
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-2xl w-full p-8">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6 text-center">
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
                  className="font-newsreader px-4 py-2 text-center rounded-full border border-gray-200 dark:border-gray-700 
                           hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors
                           text-gray-700 dark:text-gray-300"
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

function Lifecycle({ children }: { children: React.ReactNode }) {
  const { setUserId, fetchSessions } = useChatStore();
  useEffect(() => {
    async function setUserInStore() {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        console.log("[Lifecycle] No user found");
        return;
      }
      setUserId(user.id);
    }
    setUserInStore();
  }, []);

  useEffect(() => {
    fetchSessions();
  }, []);

  return children;
}

export default function Page() {
  const { sessionTitle, currentSessionId } = useChatStore();
  return (
    <Lifecycle>
      <DashboardLayout
        activePage="chat"
        breadcrumbItems={[
          { label: "Chat", href: "/chat" },
          { label: sessionTitle, href: `/chat?session=${currentSessionId}` },
        ]}
      >
        <Chat />
      </DashboardLayout>
    </Lifecycle>
  );
}
