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
  Loader2,
  SkullIcon,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { useChatStore } from "@/stores/chatStore";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Pacifico } from "next/font/google";
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
import { useEffect } from "react";

const pacifico = Pacifico({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-pacifico",
});

// Add this type outside the component
type OpenGroups = Record<string, boolean>;

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { addSession } = useChatStore();
  const router = useRouter();

  const handleCreateChat = async () => {
    const sessionId = await addSession();
    if (sessionId) {
      router.push(`/?session=${sessionId}`);
    }
  };

  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarHeader>
        <h1
          className={clsx(pacifico.className, "text-2xl px-2 pt-4 font-bold")}
        >
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
          Version 0.0.1
        </Link>
      </SidebarFooter>
    </Sidebar>
  );
}

export function NavItems({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon: LucideIcon;
    isActive?: boolean;
  }[];
}) {
  return (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton asChild isActive={item.isActive}>
            <a href={item.url}>
              <item.icon />
              <span>{item.title}</span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
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
  const { sessions, loading, currentSessionId } = useChatStore();
  const [openGroups, setOpenGroups] = React.useState<OpenGroups>({});

  // Load saved state on mount
  useEffect(() => {
    const savedState = localStorage.getItem("sidebarOpenGroups");
    if (savedState) {
      setOpenGroups(JSON.parse(savedState));
    }
  }, []);

  // Save state when it changes
  useEffect(() => {
    localStorage.setItem("sidebarOpenGroups", JSON.stringify(openGroups));
  }, [openGroups]);

  // Helper function to check if a group contains the current session
  const groupContainsCurrentSession = (sessions: ChatSession[]) => {
    return sessions.some((session) => session.id === currentSessionId);
  };

  // Handle group open/close
  const handleGroupToggle = (key: string, open: boolean) => {
    setOpenGroups((prev) => ({
      ...prev,
      [key]: open,
    }));
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
                defaultOpen={
                  openGroups[key] ??
                  (key === "Today" ||
                    groupContainsCurrentSession(sessions[key]))
                }
                onOpenChange={(open) => handleGroupToggle(key, open)}
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
