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

import { NavChatHistory } from "./NavChatHistory";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

// This is sample data.
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

export function NavChatSidebarLeft({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarHeader>
        {/* <TeamSwitcher teams={data.teams} /> */}
        <h1 className="px-2 text-lg font-bold tracking-wider leading-8">
          ZCauldron
        </h1>
        <NavMain items={data.navMain} />
      </SidebarHeader>
      <SidebarContent>
        <NavChatHistory />
        {/* <NavWorkspaces workspaces={data.workspaces} /> */}
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
