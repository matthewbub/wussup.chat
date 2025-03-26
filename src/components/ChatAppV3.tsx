"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn, processStreamingResponse } from "@/lib/utils";
import { ChatHeader } from "@/components/ChatHeader";
import { PlusIcon, Send, Menu, Sparkles, Bot, Zap, Star, Cpu } from "lucide-react";
import Link from "next/link";
import Markdown from "react-markdown";
import { ChatSession, NewMessage, useChatStore } from "@/store/chat-store";
import { useEffect } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { facade } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { appName } from "@/constants/version";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { AVAILABLE_MODELS, AiModel } from "@/constants/models";

// Placeholder subscription tier - would come from user data in a real implementation
const USER_SUBSCRIPTION_TIER = "free";
// Provider icon mapping
const PROVIDER_ICONS: Record<string, { icon: React.ElementType; color: string }> = {
  openai: { icon: Sparkles, color: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" },
  anthropic: { icon: Bot, color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" },
  google: { icon: Cpu, color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" },
  xai: { icon: Zap, color: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" },
  default: { icon: Star, color: "bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400" },
};

const ChatMessages = ({ messages }: { messages: NewMessage[] }) => {
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

const ChatInput = ({
  currentInput,
  setInput,
  isLoading,
  onSubmit,
  selectedModel,
  onModelChange,
}: {
  currentInput: string;
  setInput: (input: string) => void;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  selectedModel: { id: string; provider: string };
  onModelChange: (model: { id: string; provider: string }) => void;
}) => {
  return (
    <form onSubmit={onSubmit} className="p-4 border-t border-primary/10">
      <div className="flex flex-col md:flex-row md:items-center gap-2">
        <Select
          value={`${selectedModel.provider}/${selectedModel.id}`}
          onValueChange={(value) => {
            const [provider, id] = value.split("/");
            // Check if the model is available for the user's subscription tier
            const modelData = AVAILABLE_MODELS.find((m) => m.provider === provider && m.id === id);
            if (modelData && (USER_SUBSCRIPTION_TIER !== "free" || modelData.free)) {
              onModelChange({ provider, id });
            }
          }}
        >
          <SelectTrigger className="w-[220px]">
            {(() => {
              const selectedModelData = AVAILABLE_MODELS.find(
                (m) => m.provider === selectedModel.provider && m.id === selectedModel.id
              );
              const providerData = PROVIDER_ICONS[selectedModel.provider] || PROVIDER_ICONS.default;
              const ProviderIcon = providerData.icon;

              return (
                <div className="flex items-center gap-2">
                  <div className={`rounded-md p-1 ${providerData.color}`}>
                    <ProviderIcon className="h-4 w-4" />
                  </div>
                  <div className="truncate">{selectedModelData?.displayName || selectedModel.id}</div>
                </div>
              );
            })()}
          </SelectTrigger>
          <SelectContent>
            {AVAILABLE_MODELS.map((model: AiModel) => {
              // Get provider icon data, fallback to default if not found
              const providerData = PROVIDER_ICONS[model.provider] || PROVIDER_ICONS.default;
              const ProviderIcon = providerData.icon;
              const capitalized = model.provider.charAt(0).toUpperCase() + model.provider.slice(1);

              return (
                <SelectItem
                  key={`${model.provider}/${model.id}`}
                  value={`${model.provider}/${model.id}`}
                  className="flex items-center py-2"
                  disabled={!model.free && USER_SUBSCRIPTION_TIER === "free"}
                >
                  <div
                    className={`flex items-center gap-2 w-full ${!model.free && USER_SUBSCRIPTION_TIER === "free" ? "opacity-50" : ""}`}
                  >
                    <div className={`rounded-md p-1 ${providerData.color}`}>
                      <ProviderIcon className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1">
                        <span>{model.displayName || model.id}</span>
                        {model.free && USER_SUBSCRIPTION_TIER === "free" && (
                          <span className="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 text-xs px-1.5 py-0.5 rounded-full font-medium">
                            Free
                          </span>
                        )}
                        {!model.free && USER_SUBSCRIPTION_TIER === "free" && (
                          <span className="bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 text-xs px-1.5 py-0.5 rounded-full font-medium">
                            Premium
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">{capitalized}</span>
                    </div>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        <div className="flex-1 flex items-center gap-2">
          <Input
            type="text"
            placeholder="Message"
            value={currentInput}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading} className="flex-none w-fit">
            <Send className="h-6 w-6 dark:text-white" />
          </Button>
        </div>
      </div>
    </form>
  );
};

const ChatAppV3 = ({
  existingData,
}: {
  existingData: {
    id: string;
    name: string;
    created_at: string;
    updated_at: string;
    chat_history: { role: string; content: string }[];
  }[];
}) => {
  // get url query params
  const searchParams = useSearchParams();
  const sessionIdFromUrl = searchParams.get("session");

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
    setChatTitle,
    setSessionId,
    setMessages,
    setChatSessions,
    chatSessions,
    setModel,
  } = useChatStore();

  // Initialize chat sessions in the store
  useEffect(() => {
    setChatSessions(existingData);
  }, [existingData]);

  useEffect(() => {
    if (sessionIdFromUrl) {
      const session = existingData.find((session) => session.id === sessionIdFromUrl);
      if (session) {
        setChatTitle(session.name || "New Chat");
        setSessionId(sessionIdFromUrl);
        setMessages(session.chat_history as NewMessage[]);
      }
    }
  }, [sessionIdFromUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // reject if no input or loading
    if (!currentInput.trim() || isLoading) return;

    setLoading(true);

    try {
      // Check quota first before adding any messages
      const quotaCheck = await facade.fetchAiMessage({
        input: currentInput,
        model: selectedModel.id,
        provider: selectedModel.provider,
        messages,
        sessionId,
        checkOnly: true,
      });

      if (!quotaCheck.ok) {
        const errorData = await quotaCheck.json();
        if (quotaCheck.status === 429) {
          // Add user message and error message to chat
          addMessage(facade.humanMessage(currentInput));
          addMessage(
            facade.aiMessage(
              errorData.message || "You have reached your message limit. Please try again later or upgrade your plan."
            )
          );
          throw new Error(errorData.message);
        }
        throw new Error("Failed to check message quota");
      }

      const isFirstMessage = messages.length === 0;

      // Add user message
      addMessage(facade.humanMessage(currentInput));

      // Add empty AI message that will be streamed
      const aiMessage = facade.aiMessage("");
      addMessage(aiMessage);
      setInput("");

      // Only proceed with title and message generation if quota check passes
      if (isFirstMessage) {
        const rawTitleData = await facade.updateSessionTitle(sessionId, currentInput);
        const data = await rawTitleData.json();
        setChatTitle(data.text);
      }

      const response = await facade.fetchAiMessage({
        input: currentInput,
        model: selectedModel.id,
        provider: selectedModel.provider,
        messages,
        sessionId,
      });

      if (!response.ok) throw new Error("Failed to send message");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader available");

      await processStreamingResponse(
        reader,
        // Update content on each chunk
        (content) => {
          aiMessage.content += content;
          updateLastMessage(aiMessage.content);
        },
        // Handle metadata (usage info) when stream completes
        (usage) =>
          facade.postChatInfo({
            sessionId,
            aiMessage,
            currentInput,
            usage,
          })
      );
    } catch (error: any) {
      console.error("Error:", error);
      // Don't override quota error messages
      if (!error.message?.includes("limit")) {
        updateLastMessage("Sorry, there was an error generating the response.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-12 bg-background h-screen">
      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild className="lg:hidden absolute left-4 top-4">
          <Button variant="outline" size="icon">
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] p-0">
          <SidebarContent existingData={chatSessions} sessionId={sessionId} />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex col-span-3 border-r border-primary/10">
        <SidebarContent existingData={chatSessions} sessionId={sessionId} />
      </aside>

      <main className="col-span-12 lg:col-span-9 flex flex-col h-screen sticky top-0">
        <ChatHeader />
        <ChatMessages messages={messages} />
        <ChatInput
          currentInput={currentInput}
          setInput={setInput}
          isLoading={isLoading}
          onSubmit={handleSubmit}
          selectedModel={selectedModel}
          onModelChange={setModel}
        />
      </main>
    </div>
  );
};

const SidebarContent = ({ existingData, sessionId }: { existingData: ChatSession[]; sessionId: string }) => {
  const router = useRouter();
  const { setMessages, setSessionId, setChatTitle } = useChatStore();

  const handleNewChat = () => {
    const newSessionId = crypto.randomUUID();
    setMessages([]);
    setSessionId(newSessionId);
    setChatTitle("New Chat");
    router.push(`/?session=${newSessionId}`);
  };

  return (
    <div className="flex flex-col h-full max-h-screen">
      <div className="flex-none p-6 border-b border-primary/5">
        <Link href="/" className="font-mono text-xl font-bold text-primary hover:opacity-80 transition-opacity">
          {appName}
        </Link>
      </div>

      <div className="flex-none p-4">
        <Button
          variant="outline"
          className="w-full group transition-all hover:bg-primary hover:text-primary-foreground"
          onClick={handleNewChat}
        >
          <PlusIcon className="h-4 w-4 mr-2 group-hover:text-primary-foreground" />
          New Chat
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="sticky top-0 bg-background pt-4 pb-2">
          <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-3 font-medium">
            Recent Conversations
          </h2>
        </div>
        <div className="space-y-1">
          {existingData.map((session) => (
            <Link
              href={`/?session=${session.id}`}
              key={session.id}
              className={cn(
                "block py-2 px-3 rounded-md text-sm text-foreground/80 hover:bg-primary/5 hover:text-primary transition-colors truncate",
                {
                  "bg-primary/5 text-primary": session.id === sessionId,
                }
              )}
            >
              {session.name || session.id}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatAppV3;
