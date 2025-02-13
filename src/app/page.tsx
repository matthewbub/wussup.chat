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
import { useSubscriptionStore } from "@/stores/useSubscription";
import { subscriptionService } from "@/services/subscription";

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
  const { setSubscription, setLoading, setError } = useSubscriptionStore();

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

      // Check subscription status
      setLoading(true);
      try {
        const subscription = await subscriptionService.hasActiveSubscription();
        setSubscription({
          isSubscribed: true,
          ...subscription,
        });
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to check subscription"
        );
      } finally {
        setLoading(false);
      }
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
  const { sessions, setCurrentSession, currentSessionId } = useChatStore();
  const params = useSearchParams();
  const sessionId = params.get("session");

  // Add this effect to sync URL session with store
  useEffect(() => {
    // If URL has no session but store does, clear it
    if (!sessionId && currentSessionId) {
      setCurrentSession(null);
    }
    // If URL has session, set it
    else if (sessionId) {
      setCurrentSession(sessionId);
    }
  }, [sessionId, currentSessionId, setCurrentSession]);

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
