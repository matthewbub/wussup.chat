"use client";
import * as React from "react";
import {
  SidebarFooter,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import {
  ChevronRight,
  HelpCircle,
  File,
  Plus,
  type LucideIcon,
  SkullIcon,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { useChatStore } from "@/stores/chatStore";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import clsx from "clsx";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenuBadge,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  CollapsibleContent,
  CollapsibleTrigger,
  Collapsible,
} from "@/components/ui/collapsible";
import { ChatSession } from "@/types/chat";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter();
  const { addSession, user } = useChatStore();
  const handleCreateChat = async () => {
    const sessionId = crypto.randomUUID();
    if (sessionId) {
      router.push(`/~/chat?session=${sessionId}`);
    }
    // push temporary chat to the sidebar
    addSession(sessionId, user?.user_id as string);
  };

  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarHeader>
        <h1 className={clsx("font-title text-2xl px-2 pt-4 font-bold")}>
          Wussup
        </h1>
      </SidebarHeader>
      <SidebarContent>
        <div className="p-2">
          <Button
            variant="outline"
            className="w-full justify-center"
            onClick={handleCreateChat}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Chat
          </Button>
        </div>

        <NavWorkspaces className="flex-1" />

        <SidebarSeparator />
        <NavSecondary
          items={[
            {
              title: "Support",
              url: "/support",
              icon: HelpCircle,
              hide: !!process.env.NEXT_PUBLIC_LOCAL_MODE,
            },
            {
              title: "Legal",
              url: "https://ninembs.studio/legal/terms",
              icon: File,
              external: true,
              hide: !!process.env.NEXT_PUBLIC_LOCAL_MODE,
            },
          ]}
        />
      </SidebarContent>
      <SidebarFooter>
        <Link
          href="/support"
          className="px-4 text-xs text-muted-foreground text-right"
        >
          Version 0.0.3
        </Link>
      </SidebarFooter>
    </Sidebar>
  );
}

export function NavSecondary({
  items,
  ...props
}: {
  items: {
    title: string;
    url: string;
    icon: LucideIcon;
    badge?: React.ReactNode;
    external?: boolean;
    hide?: boolean;
  }[];
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items
            .filter((item) => !item.hide)
            .map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <a
                    href={item.url}
                    target={item.external ? "_blank" : "_self"}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
                {item.badge && (
                  <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                )}
              </SidebarMenuItem>
            ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function NavWorkspaces({ className }: { className?: string }) {
  const { sessions, loading } = useChatStore();
  const searchParams = useSearchParams();
  const currentSessionId = searchParams.get("session");

  // Use currentSessionId from URL instead of store
  const groupContainsCurrentSession = (sessions: ChatSession[]) => {
    return sessions.some((session) => session.id === currentSessionId);
  };

  return (
    <SidebarGroup className={className}>
      <SidebarGroupLabel>Chat History</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {/* If there are no sessions, show the create chat button */}
          {!loading && Object.keys(sessions).length == 0 && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild disabled>
                <div className="flex items-center gap-2">
                  <SkullIcon />
                  <span>No chats yet</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}

          {/* If there are sessions, show the collapsible menu */}
          {Object.keys(sessions).length > 0 &&
            Object.keys(sessions).map((key: string) => (
              <Collapsible
                key={key}
                defaultOpen={groupContainsCurrentSession(sessions[key])}
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center gap-2 group">
                      <SidebarMenuButton asChild>
                        <span className="pl-8">{key}</span>
                      </SidebarMenuButton>
                      <SidebarMenuAction className="left-1.5 data-[state=open]:rotate-90 group-data-[state=open]:rotate-90">
                        <ChevronRight />
                      </SidebarMenuAction>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {sessions[key].map((session) => (
                        <SidebarMenuSubItem key={session.id}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={session.id === currentSessionId}
                          >
                            <Link href={`/~/chat?session=${session.id}`}>
                              <span>{session.name}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
