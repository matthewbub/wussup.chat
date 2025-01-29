"use client";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
} from "@/components/ui/sidebar";
import { useChatStore } from "@/stores/chatStore";
import LoadingPulse from "@/components/ui/Loading";
import { ChatHistoryItem } from "./ChatHistoryItem";

export function ChatHistory() {
  const { sessions, loading } = useChatStore();

  return (
    <div>
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel className="flex justify-between items-center sticky top-0 bg-sidebar z-10">
          <div className="w-full">Chat History</div>
        </SidebarGroupLabel>
        <SidebarMenu>
          {loading ? (
            <div className="flex flex-col justify-center items-center gap-2 my-20">
              <LoadingPulse size="small" />
              <span className="text-muted-foreground text-xs">Loading...</span>
            </div>
          ) : sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
              <div className="text-muted-foreground text-sm">
                No chat history yet
              </div>
              <div className="text-xs text-muted-foreground/70 mt-1">
                Start a new chat to begin
              </div>
            </div>
          ) : (
            sessions.map((session) => (
              <ChatHistoryItem key={session.id} session={session} />
            ))
          )}
        </SidebarMenu>
      </SidebarGroup>
    </div>
  );
}
