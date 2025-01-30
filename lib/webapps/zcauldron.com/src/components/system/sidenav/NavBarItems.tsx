"use client";

import * as React from "react";
import { MessageCircle, Plus } from "lucide-react";
import { NavMain } from "@/components/system/sidenav/NavMain";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { ChatHistory } from "@/app/chat/ChatHistory";
import { Folders } from "@/app/documents/Folders";
import { useModalStore } from "@/stores/modalStore";
import { useChatStore } from "@/stores/chatStore";
import { useAuthStore } from "@/stores/authStore";
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

export function NavBarItems({
  activePage = "home",
  ...props
}: React.ComponentProps<typeof Sidebar> & { activePage?: string }) {
  const nav = data.navMain.map((item) => ({
    title: item.title,
    url: item.url,
    isActive: item.title.toLowerCase() === activePage.toLowerCase(),
    icon: item.icon,
  }));
  const { openModal } = useModalStore();
  const { addSession } = useChatStore();
  const { user } = useAuthStore();
  const router = useRouter();

  const handleCreateChat = async () => {
    if (user?.id) {
      const sessionId = await addSession(user.id);
      if (sessionId) {
        router.push(`/chat?session=${sessionId}`);
      }
    }
  };

  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarHeader>
        <h1 className="text-sm px-2 font-bold tracking-wider leading-8">
          (ninembs)
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
            <NavMain items={nav} />
          </div>
        )}
        {activePage === "chat" && <ChatHistory />}
        {activePage === "documents" && (
          <Folders onCreateFile={() => openModal("file")} />
        )}
      </SidebarContent>
    </Sidebar>
  );
}
