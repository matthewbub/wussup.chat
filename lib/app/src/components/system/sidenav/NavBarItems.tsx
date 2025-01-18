"use client";

import * as React from "react";
import {
  FileText,
  Home,
  MessageCircle,
  MessageCircleQuestion,
  Image,
  Settings2,
  Sparkles,
  Trash2,
} from "lucide-react";

import { NavMain } from "@/components/system/sidenav/NavMain";
import { NavSecondary } from "@/components/system/sidenav/NavSecondary";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { ChatHistory } from "@/app/chat/ChatHistory";
import { Folders } from "@/app/documents/Folders";
const data = {
  navMain: [
    {
      title: "Ask AI",
      url: "/ask",
      icon: Sparkles,
    },
    {
      title: "Home",
      url: "/home",
      icon: Home,
      isActive: true,
    },
    {
      title: "Documents",
      url: "/documents",
      icon: FileText,
      badge: "10",
    },
    {
      title: "Chat",
      url: "/chat",
      icon: MessageCircle,
    },
    {
      title: "Media",
      url: "/media",
      icon: Image,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/settings",
      icon: Settings2,
    },
    {
      title: "Trash",
      url: "/trash",
      icon: Trash2,
    },
    {
      title: "Help",
      url: "/support",
      icon: MessageCircleQuestion,
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

  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarHeader>
        {/* <TeamSwitcher teams={data.teams} /> */}
        <h1 className="px-2 text-lg font-bold tracking-wider leading-8">
          ZCauldron
        </h1>
        <NavMain items={nav} />
      </SidebarHeader>
      <SidebarContent>
        {activePage === "chat" && <ChatHistory />}
        {activePage === "documents" && <Folders />}
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
