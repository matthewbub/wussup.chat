"use client";

import * as React from "react";
import {
  SidebarFooter,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { SkullIcon } from "lucide-react";
import { Sidebar, SidebarContent, SidebarHeader } from "@/components/ui/sidebar";
import clsx from "clsx";
import { SidebarGroup, SidebarGroupContent } from "@/components/ui/sidebar";
import { ChatSession } from "@/types/chat";
import { CreateChatButton } from "@/app/chat/_components/CreateChatButton";
import { useChatStore } from "@/app/chat/_store/chat";
import { version } from "@/constants/version";

export function AppSidebar({
  sessions,
  ...props
}: {
  sessions: ChatSession[];
} & React.ComponentProps<typeof Sidebar>) {
  const { currentSession } = useChatStore();

  const getCurrentSessionName = (session: ChatSession) => {
    if (currentSession?.id === session.id && currentSession?.name) {
      return currentSession.name;
    } else if (session.name) {
      return session.name;
    }
    return `Untitled Chat ${Object.values(sessions).flat().length + 1}`;
  };

  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarHeader>
        <h1 className={clsx("font-title text-2xl px-2 pt-4 font-bold")}>Wussup</h1>
      </SidebarHeader>
      <SidebarContent>
        {/* CREATE CHAT BUTTON */}
        <div className="p-2 sticky top-0 z-10 bg-sidebar">
          <CreateChatButton />
        </div>

        {/* CHAT HISTORY */}
        <SidebarGroup className="h-full">
          <SidebarGroupLabel className="sticky top-12 z-10 bg-sidebar font-bold">Chat History</SidebarGroupLabel>
          <SidebarGroupContent className="flex-1">
            <SidebarMenu>
              {/* If there are no sessions, show the create chat button */}
              {sessions.length == 0 && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild disabled>
                    <div className="flex items-center gap-2">
                      <SkullIcon />
                      <span>No chats yet</span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              {sessions.map((session: ChatSession) => (
                <React.Fragment key={session?.id}>
                  <SidebarMenuItem key={session?.id}>
                    <SidebarMenuButton asChild isActive={session?.id === currentSession?.id}>
                      <Link href={`/chat?session=${session?.id}`}>
                        <span>
                          {currentSession?.id === session?.id ? getCurrentSessionName(session) : session?.name}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </React.Fragment>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>

          <SidebarGroupContent className="flex flex-col gap-2 sticky bottom-0 bg-sidebar">
            <SidebarSeparator />
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/chat">Chat</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/settings">Settings</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
            <SidebarSeparator />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* FOOTER */}
      <SidebarFooter>
        <Link href="/support" className="px-4 text-xs text-muted-foreground text-right">
          Version {version}
        </Link>
      </SidebarFooter>
    </Sidebar>
  );
}
