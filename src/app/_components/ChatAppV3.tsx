"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { SignInButton, SignUpButton, SignedOut, UserButton, SignedIn } from "@clerk/nextjs";
import { PlusIcon, Send } from "lucide-react";
import Link from "next/link";
import Markdown from "react-markdown";
import { useChatStore } from "@/store/chat-store";
import { useCallback } from "react";
import { processStreamingResponse } from "@/lib/utils";

const controls = ["sidebar/left", "fontsize/lg"];

const ChatAppV3 = () => {
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
  } = useChatStore();

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!currentInput.trim() || isLoading) return;

      // Add user message
      const userMessage = {
        id: crypto.randomUUID(),
        content: currentInput,
        role: "user" as const,
      };
      addMessage(userMessage);

      // Add empty AI message that will be streamed
      const aiMessage = {
        id: crypto.randomUUID(),
        content: "",
        role: "assistant" as const,
      };
      addMessage(aiMessage);
      setLoading(true);
      setInput("");

      try {
        const formData = new FormData();
        formData.append("content", currentInput);
        formData.append("model", selectedModel.id);
        formData.append("model_provider", selectedModel.provider);
        formData.append("messageHistory", JSON.stringify(messages));
        formData.append("session_id", sessionId);

        const response = await fetch("/api/v3/ai", {
          method: "POST",
          body: formData,
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
          (usage) => {
            fetch("/api/v3/info", {
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
            }).catch(console.error);
          }
        );
      } catch (error) {
        console.error("Error:", error);
        updateLastMessage("Sorry, there was an error generating the response.");
      } finally {
        setLoading(false);
      }
    },
    [currentInput, isLoading, messages, selectedModel, sessionId]
  );

  const controlledFontSize = cn({
    "text-base": controls.includes("fontsize/base"),
    "text-sm": controls.includes("fontsize/sm"),
    "text-lg": controls.includes("fontsize/lg"),
    "text-xl": controls.includes("fontsize/xl"),
    "text-2xl": controls.includes("fontsize/2xl"),
  });

  return (
    <div className="grid grid-cols-12 bg-primary h-screen">
      <aside
        className={cn("col-span-3 border-r border-primary/10 p-4 flex flex-col gap-4", {
          "order-2": controls.includes("sidebar/right"),
        })}
      >
        <div>
          <h2 className="text-xl font-bold">Wussup Chat</h2>
        </div>
        <div>
          <Button variant="outline" className="w-full">
            <PlusIcon className="mr-2 h-4 w-4" />
            New Chat
          </Button>
        </div>

        <div className="flex-1 overflow-auto">
          <ul className="space-y-2">
            <li>
              <Link href="/chat/1" className={cn("block p-2 rounded hover:bg-primary/10", controlledFontSize)}>
                Chat 1
              </Link>
            </li>
          </ul>
        </div>
      </aside>

      <main
        className={cn("col-span-9 flex flex-col h-screen", {
          "order-1": controls.includes("sidebar/right"),
        })}
      >
        <header className="flex items-center justify-between p-4 border-b border-primary/10">
          <h1 className={controlledFontSize}>Chat</h1>

          <div className="flex flex-1 justify-end gap-4">
            <SignedOut>
              <SignInButton>
                <Button variant="ghost">Sign In</Button>
              </SignInButton>
              <SignUpButton>
                <Button variant="default">Sign Up</Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}>
              <div
                className={cn("rounded-lg p-3 max-w-[80%]", {
                  "bg-primary text-primary-foreground": message.role === "assistant",
                  "bg-stone-800 text-primary-foreground": message.role === "user",
                })}
              >
                <Markdown
                  className={cn("prose dark:prose-invert prose-p:leading-relaxed prose-pre:p-0", {
                    "prose-sm": controls.includes("fontsize/sm"),
                    "prose-base prose-pre:leading-5": controls.includes("fontsize/lg"),
                    "prose-lg prose-pre:leading-5": controls.includes("fontsize/xl"),
                    "prose-xl prose-pre:leading-5": controls.includes("fontsize/2xl"),
                  })}
                >
                  {message.content}
                </Markdown>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="p-4 border-t border-primary/10">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Message"
              value={currentInput}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default ChatAppV3;
