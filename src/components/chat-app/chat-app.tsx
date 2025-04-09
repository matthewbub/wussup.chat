"use client";

import { ChatAppInput } from "@/components/chat-app/input";
import { ChatAppMessages } from "@/components/chat-app/messages";
import { ChatAppSidebarV2 } from "@/components/chat-app/sidebar";
import { ChatAppMobileSidebarV2 } from "@/components/chat-app/mobile-sidebar";
import { useChatStore } from "@/store/chat-store";
import * as Sentry from "@sentry/nextjs";
import {
  createHumanMessage,
  createAiMessage,
  fetchAiMessage,
  processStreamingResponse,
} from "@/lib/format/format-utils";
import { IconSidebar } from "@/components/IconSidebar";
import { SubscriptionStatus } from "@/lib/subscription/subscription-facade";
import { SessionWrapper } from "./session-wrapper";
import { Loader2 } from "lucide-react";
import { AlertTitle, AlertDescription } from "../ui/alert";
import { Alert } from "../ui/alert";
import { useRouter } from "next/navigation";
import Link from "next/link";

const ChatAppV3 = ({
  existingData,
  userSubscriptionInfo,
  userError,
}: {
  existingData: {
    id: string;
    name: string;
    created_at: string;
    updated_at: string;
    chat_history: { role: string; content: string }[];
  }[];
  userSubscriptionInfo: SubscriptionStatus | null;
  userError?: string | null;
}) => {
  const {
    messages,
    currentInput,
    isLoading,
    selectedModel,
    sessionId,
    setInput,
    addMessage,
    updateLastMessage,
    setLoading,
    updateSessionTitle,
    setModel,
    chatSessions,
    isLoadingChatHistory,
  } = useChatStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    if (userError) {
      router.push("/login");
      return;
    }
    e.preventDefault();

    // reject if no input or loading
    if (!currentInput.trim() || isLoading) return;

    addMessage(createHumanMessage(currentInput));
    setInput("");

    setLoading(true);

    try {
      // Add empty AI message that will be streamed
      const aiMessage = createAiMessage("");
      addMessage(aiMessage);

      const isFirstMessage = (messages && messages.length === 0) || messages === null;
      // Only proceed with title and message generation if quota check passes
      if (isFirstMessage) {
        const response = await fetch("/api/v3/threads", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ threadId: sessionId, generateNameFromContent: currentInput }),
        });
        const newThread = await response.json();

        // console.log("titleData", titleData);
        if (newThread.data.name) {
          updateSessionTitle(sessionId, newThread.data.name);
        }
      }

      const response = await fetchAiMessage({
        input: currentInput,
        model: selectedModel.id,
        provider: selectedModel.provider,
        messages:
          messages?.map((msg) => ({
            id: crypto.randomUUID(),
            content: msg.content,
            role: msg.role,
          })) || [],
        sessionId,
      });

      if (!response.ok) throw new Error("Failed to send message");
      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader available");
      await processStreamingResponse(
        reader,
        // Update content on each chunk
        (content: string) => {
          aiMessage.content += content;
          updateLastMessage(aiMessage.content);
        },
        // Handle metadata (usage info) when stream completes
        (usage: { promptTokens: number; completionTokens: number }) => {
          const fetchInfo = async () => {
            const res = await fetch("/api/v3/info", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                sessionId,
                aiMessage: {
                  ...aiMessage,
                  input: currentInput,
                  output: aiMessage.content,
                  prompt_tokens: usage.promptTokens,
                  completion_tokens: usage.completionTokens,
                },
              }),
            });
            const data = await res.json();
            console.log("data", data);
          };
          fetchInfo();
        }
      );
    } catch (error: unknown) {
      console.error("Error:", error);
      // Don't override quota error messages
      if (error instanceof Error && !error.message.includes("limit")) {
        Sentry.captureException(error);
        console.error("Error:", error);
        updateLastMessage("Sorry, there was an error generating the response.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SessionWrapper existingData={existingData}>
      <div className="flex h-full overflow-hidden">
        {/* App navigation */}
        <IconSidebar />

        {/* Desktop Sidebar */}
        <div className="hidden md:block relative w-72">
          <div className="absolute inset-0 border-r border-border">
            <ChatAppSidebarV2 existingData={chatSessions} sessionId={sessionId} />
          </div>
        </div>

        {/* Mobile Sidebar */}
        <ChatAppMobileSidebarV2 sessionId={sessionId} />

        <main className="flex-1 flex flex-col min-w-0 relative">
          {userError && (
            <div className="absolute top-10 left-0 right-0 flex items-center justify-center mx-4">
              <Alert>
                <AlertTitle>Error locating your account</AlertTitle>
                <AlertDescription className="flex">
                  Awww snap! We couldn't log you in, or had trouble signing you in as a guest. Please{" "}
                  <Link href="/sign-in" className="text-primary hover:underline">
                    sign in
                  </Link>{" "}
                  to continue.
                </AlertDescription>
              </Alert>
            </div>
          )}
          <div className="flex-1 overflow-y-auto">
            <ChatAppMessages messages={messages || []} userError={userError} />
          </div>
          {isLoadingChatHistory && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          )}
          <ChatAppInput
            currentInput={currentInput}
            setInput={setInput}
            isLoading={isLoading}
            onSubmit={handleSubmit}
            selectedModel={selectedModel}
            onModelChange={setModel}
            userSubscriptionInfo={userSubscriptionInfo}
          />
        </main>
      </div>
    </SessionWrapper>
  );
};

export default ChatAppV3;
