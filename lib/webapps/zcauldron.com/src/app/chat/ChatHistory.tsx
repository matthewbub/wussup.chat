"use client";

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
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useChatStore } from "@/stores/chatStore";
import LoadingPulse from "@/components/ui/Loading";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function ChatHistory() {
  const { isMobile } = useSidebar();
  const { sessions, loading, setCurrentSession } = useChatStore();
  const router = useRouter();

  const handleChatSelect = (sessionId: string) => {
    setCurrentSession(sessionId);
    router.push(`/chat?session=${sessionId}`);
  };

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
              <SidebarMenuItem key={session.id}>
                <SidebarMenuButton
                  asChild
                  onClick={() => handleChatSelect(session.id)}
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
                    <DropdownMenuItem>
                      <Pencil className="text-muted-foreground" />
                      <span>Rename Chat</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <LinkIcon className="text-muted-foreground" />
                      <span>Copy Link</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <ArrowUpRight className="text-muted-foreground" />
                      <span>Open in New Tab</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Trash2 className="text-muted-foreground" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            ))
          )}
          {/* TODO Implement this later */}
          {/*<SidebarMenuItem>*/}
          {/*  <SidebarMenuButton className="text-sidebar-foreground/70">*/}
          {/*    <MoreHorizontal />*/}
          {/*    <span>More</span>*/}
          {/*  </SidebarMenuButton>*/}
          {/*</SidebarMenuItem>*/}
        </SidebarMenu>
      </SidebarGroup>
    </div>
  );
}
