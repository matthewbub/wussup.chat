import * as React from "react";
import {
  SidebarFooter,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { SkullIcon } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar";
import clsx from "clsx";
import { SidebarGroup, SidebarGroupContent } from "@/components/ui/sidebar";
import { ChatSession } from "@/types/chat";
import { CreateChatButton } from "@/app/~/[session]/_components/CreateChatButton";

export function AppSidebar({
  sessions,
  currentSessionId,
  ...props
}: {
  sessions: Record<string, ChatSession[]>;
  currentSessionId: string;
} & React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarHeader>
        <h1 className={clsx("font-title text-2xl px-2 pt-4 font-bold")}>
          Wussup
        </h1>
      </SidebarHeader>
      <SidebarContent>
        {/* CREATE CHAT BUTTON */}
        <div className="p-2">
          <CreateChatButton />
        </div>

        {/* CHAT HISTORY */}
        <SidebarGroup>
          <SidebarGroupLabel>Chat History</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* If there are no sessions, show the create chat button */}
              {Object.keys(sessions).length == 0 && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild disabled>
                    <div className="flex items-center gap-2">
                      <SkullIcon />
                      <span>No chats yet</span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              {/* Display sessions grouped by date */}
              {Object.keys(sessions).length > 0 &&
                Object.keys(sessions).map((dateKey: string) => (
                  <React.Fragment key={dateKey}>
                    <SidebarMenuItem>
                      <div className="px-2 py-1 text-xs text-muted-foreground">
                        {dateKey}
                      </div>
                    </SidebarMenuItem>
                    {sessions[dateKey].map((session: ChatSession) => (
                      <SidebarMenuItem key={session.id}>
                        <SidebarMenuButton
                          asChild
                          isActive={session.id === currentSessionId}
                        >
                          <Link href={`/~/${session.id}`}>
                            <span>{session.name}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </React.Fragment>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* FOOTER */}
      <SidebarFooter>
        <Link
          href="/support"
          className="px-4 text-xs text-muted-foreground text-right"
        >
          Version 0.0.4
        </Link>
      </SidebarFooter>
    </Sidebar>
  );
}
