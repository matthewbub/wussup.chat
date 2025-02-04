"use client";
import * as React from "react";
import { type LucideIcon } from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { MessageCircle, Plus } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { ChatHistory } from "@/components/chat/ChatHistory";
import { useChatStore } from "@/stores/chatStore";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const data = {
  navMain: [
    {
      title: "Chat",
      url: "/chat",
      icon: MessageCircle,
    },
  ],
};

export function AppSidebar({
  activePage = "home",
  ...props
}: React.ComponentProps<typeof Sidebar> & { activePage?: string }) {
  const nav = data.navMain.map((item) => ({
    title: item.title,
    url: item.url,
    isActive: item.title.toLowerCase() === activePage.toLowerCase(),
    icon: item.icon,
  }));
  const { addSession } = useChatStore();
  const router = useRouter();

  const handleCreateChat = async () => {
    const sessionId = await addSession();
    if (sessionId) {
      router.push(`/chat?session=${sessionId}`);
    }
  };

  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarHeader>
        <h1 className="text-2xl px-2 pt-4 font-bold tracking-wider leading-8 font-newsreader">
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
        {activePage !== "chat" && (
          <div className="flex flex-col p-2">
            <NavItems items={nav} />
          </div>
        )}
        {activePage === "chat" && <ChatHistory />}
        {/* {activePage === "documents" && (
          <Folders onCreateFile={() => openModal("file")} />
        )} */}
      </SidebarContent>
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
