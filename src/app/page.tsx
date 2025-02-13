"use client";

import { useChatStore } from "@/stores/chatStore";
import { ChatLayout } from "@/components/DashboardLayout";
import { ChatUserInput } from "@/components/chat/ChatUserInput";
import { ChatMessages } from "@/components/chat/ChatMessages";
import { useEffect } from "react";
import { createClient } from "@/lib/supabase-client";
import { ChatSession } from "@/types/chat";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import useNavUserStore from "@/stores/useNavUserStore";

const Chat: React.FC = () => {
  const { currentSessionId, setNewMessage } = useChatStore();

  return (
    <div className="flex flex-col h-[calc(100vh-100px)]">
      {currentSessionId ? (
        <ChatMessages />
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-2xl w-full p-8">
            <div className="flex flex-col items-center justify-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 text-center">
                Start a New Conversation
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
                Don&apos;t know what to ask? Try one of these prompts:
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                "Write a song about cats",
                "Suggest names for my business",
                "Briefly summarize gulliver's travels",
                "Suggest dinner ideas for 2 people",
              ].map((prompt) => (
                <button
                  key={prompt}
                  className="px-4 py-2 text-center rounded-full border border-gray-200 dark:border-gray-700
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
  const { openAuth } = useNavUserStore();
  useEffect(() => {
    async function setUserInStore() {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        // force auth modal to stay open til user is logged in
        openAuth();
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
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PageContent />
    </Suspense>
  );
}

function PageContent() {
  const { sessions, setCurrentSession } = useChatStore();
  const params = useSearchParams();
  const sessionId = params.get("session");

  // Add this effect to sync URL session with store
  useEffect(() => {
    if (sessionId) {
      setCurrentSession(sessionId);
    }
  }, [sessionId, setCurrentSession]);

  const currentSession = Object.values(sessions)
    .flat()
    .find((session) => session.id === sessionId);

  return (
    <Lifecycle>
      <ChatLayout session={currentSession as ChatSession}>
        <Chat />
      </ChatLayout>
    </Lifecycle>
  );
}
