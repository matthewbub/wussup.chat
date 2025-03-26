"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { ChatSession, useChatStore } from "@/store/chat-store";
import { useRouter } from "next/navigation";
import { appName } from "@/constants/version";

export const ChatAppSidebar = ({ existingData, sessionId }: { existingData: ChatSession[]; sessionId: string }) => {
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
