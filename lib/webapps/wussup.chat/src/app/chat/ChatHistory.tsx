"use client";

import { useRouter } from "next/navigation";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
} from "@/components/ui/sidebar";
import { useChatStore } from "@/stores/chatStore";
import LoadingPulse from "@/components/ui/Loading";
import Link from "next/link";
import { SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { ChatSession } from "@/types/chat";

import {
  ArrowUpRight,
  Link as LinkIcon,
  MoreHorizontal,
  Trash2,
  Pencil,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenuAction, useSidebar } from "@/components/ui/sidebar";
import { createClient } from "@/lib/supabase-client";
import { useEffect } from "react";

export function ChatHistory() {
  const { sessions, loading, fetchSessions } = useChatStore();
  useEffect(() => {
    fetchSessions();
  }, []);

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
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center border-dashed border-gray-200">
            <div className="text-muted-foreground text-sm">
              No chat history yet
            </div>
            <div className="font-newsreader text-sm text-muted-foreground/70 mt-1">
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
            {groupedSessions[period]
              .sort(
                (a, b) =>
                  new Date(b.created_at).getTime() -
                  new Date(a.created_at).getTime()
              )
              .map((session) => (
                <ChatHistoryItem key={session.id} session={session} />
              ))}
          </div>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}

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
      <SidebarMenuButton
        asChild
        onClick={() => handleChatSelect(session.id)}
        className="px-4"
      >
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
      <ChatItemDropdown session={session} />
    </SidebarMenuItem>
  );
}

export function ChatItemDropdown({ session }: { session: ChatSession }) {
  const { isMobile } = useSidebar();
  const { deleteSession, updateSessionTitle } = useChatStore();
  const router = useRouter();

  const handleRenameChat = async () => {
    const newName = window.prompt("Enter new name for chat:", session.name);
    if (newName && newName !== session.name) {
      await updateSessionTitle(session.id, newName);
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/chat?session=${session.id}`;
    navigator.clipboard.writeText(url);
  };

  const handleOpenInNewTab = () => {
    window.open(`/chat?session=${session.id}`, "_blank");
  };

  const handleDeleteChat = async () => {
    if (window.confirm("Are you sure you want to delete this chat?")) {
      await deleteSession(session.id);
      router.push("/chat");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuAction showOnHover>
          <MoreHorizontal />
          <span className="sr-only">More</span>
        </SidebarMenuAction>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56 rounded-lg"
        side={isMobile ? "bottom" : "right"}
        align={isMobile ? "end" : "start"}
      >
        <DropdownMenuItem onClick={handleRenameChat}>
          <Pencil className="text-muted-foreground" />
          <span>Rename Chat</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleCopyLink}>
          <LinkIcon className="text-muted-foreground" />
          <span>Copy Link</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleOpenInNewTab}>
          <ArrowUpRight className="text-muted-foreground" />
          <span>Open in New Tab</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDeleteChat}>
          <Trash2 className="text-muted-foreground" />
          <span>Delete</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
