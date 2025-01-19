"use client";

import {
  ArrowUpRight,
  Link as LinkIcon,
  MoreHorizontal,
  StarOff,
  Trash2,
  PlusCircle,
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
import { useAuthStore } from "@/stores/authStore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/Tooltip";

export function ChatHistory() {
  const { isMobile } = useSidebar();
  const { sessions, loading, addSession } = useChatStore();
  const { user } = useAuthStore();
  const router = useRouter();

  const handleNewChat = () => {
    if (user?.id) {
      addSession(user.id);
      router.push("/chat");
    }
  };

  return (
    <div>
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel className="flex justify-between items-center sticky top-0 bg-sidebar z-10">
          <div className="w-full">Chat History</div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <SidebarMenuButton onClick={handleNewChat} className="w-fit">
                  <PlusCircle className="h-4 w-4" />
                  <span className="sr-only">New Chat</span>
                </SidebarMenuButton>
              </TooltipTrigger>
              <TooltipContent>
                <p>New Chat</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
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
                <SidebarMenuButton asChild>
                  <Link
                    href={`/chat?session=${session.id}`}
                    title={session.name}
                  >
                    {/* <span>{item.emoji}</span> */}
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
                      <StarOff className="text-muted-foreground" />
                      <span>Remove from Chat History</span>
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
