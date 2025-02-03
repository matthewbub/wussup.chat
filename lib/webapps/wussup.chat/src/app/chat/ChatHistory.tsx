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

  if (loading) {
    return (
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel className="flex justify-between items-center sticky top-0 bg-sidebar z-10">
          <div className="w-full">Chat History</div>
        </SidebarGroupLabel>
        <SidebarMenu>
          <div className="flex flex-col justify-center items-center gap-2 my-20">
            <LoadingPulse size="small" />
            <span className="text-muted-foreground text-xs">Loading...</span>
          </div>
        </SidebarMenu>
      </SidebarGroup>
    );
  }

  if (sessions.length === 0) {
    return (
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel className="flex justify-between items-center sticky top-0 bg-sidebar z-10">
          <div className="w-full">Chat History</div>
        </SidebarGroupLabel>
        <SidebarMenu>
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <div className="text-muted-foreground text-sm">
              No chat history yet
            </div>
            <div className="text-xs text-muted-foreground/70 mt-1">
              Start a new chat to begin
            </div>
          </div>
        </SidebarMenu>
      </SidebarGroup>
    );
  }

  // Group sessions by relative time period
  const groupedSessions = sessions.reduce((groups, session) => {
    const date = new Date(session.created_at);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    const isThisWeek = (() => {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      return date >= weekStart && !isToday;
    })();

    const isThisMonth = (() => {
      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear() &&
        !isToday &&
        !isThisWeek
      );
    })();

    const period = isToday
      ? "Today"
      : isThisWeek
      ? "This Week"
      : isThisMonth
      ? "This Month"
      : "Older";

    if (!groups[period]) {
      groups[period] = [];
    }
    groups[period].push(session);
    return groups;
  }, {} as Record<string, typeof sessions>);

  // Define display order
  const periodOrder = ["Today", "This Week", "This Month", "Older"];
  const sortedGroups = periodOrder.filter(
    (period) => groupedSessions[period]?.length
  );

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel className="flex justify-between items-center sticky top-0 bg-sidebar z-10">
        <div className="w-full">Chat History</div>
      </SidebarGroupLabel>
      <SidebarMenu>
        {sortedGroups.map((period) => (
          <div key={period}>
            <div className="px-2 py-2 text-xs font-medium text-muted-foreground">
              {period}
            </div>
            {groupedSessions[period].map((session) => (
              <ChatHistoryItem key={session.id} session={session} />
            ))}
          </div>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
