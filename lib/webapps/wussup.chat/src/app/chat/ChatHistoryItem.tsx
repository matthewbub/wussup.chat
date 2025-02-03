"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useChatStore } from "@/stores/chatStore";
import { SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { ChatSession } from "@/types/chat"; // You'll need to create this type
import { ChatItemDropdown } from "./ChatItemDropdown";

interface ChatHistoryItemProps {
  session: ChatSession;
}

export function ChatHistoryItem({ session }: ChatHistoryItemProps) {
  const { setCurrentSession } = useChatStore();
  const router = useRouter();

  const handleChatSelect = (sessionId: string) => {
    setCurrentSession(sessionId);
    router.push(`/chat?session=${sessionId}`);
  };

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild onClick={() => handleChatSelect(session.id)}>
        <Link
          href={`/chat?session=${session.id}`}
          title={session.name}
          onClick={(e) => {
            e.preventDefault();
            handleChatSelect(session.id);
          }}
        >
          <span>{session.name}</span>
        </Link>
      </SidebarMenuButton>
      <ChatItemDropdown />
    </SidebarMenuItem>
  );
}
