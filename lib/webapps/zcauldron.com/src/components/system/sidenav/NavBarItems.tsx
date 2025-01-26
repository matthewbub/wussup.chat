"use client";

import * as React from "react";
import { MessageCircle } from "lucide-react";
import { NavMain } from "@/components/system/sidenav/NavMain";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { ChatHistory } from "@/app/chat/ChatHistory";
import { Folders } from "@/app/documents/Folders";
import { useModalStore } from "@/stores/modalStore";

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

  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarHeader>
        <h1 className="px-2 font-bold tracking-wider leading-8">
          The (ninembs) Studio
        </h1>
      </SidebarHeader>
      <SidebarContent>
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
