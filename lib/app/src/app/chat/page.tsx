"use client";

import { useChatStore } from "@/stores/chatStore";
import { Chat } from "./Chat";
import { DashboardLayout } from "@/components/system/DashboardLayout";

export default function Page() {
  const { sessionTitle, currentSessionId } = useChatStore();
  return (
    <DashboardLayout
      activePage="chat"
      breadcrumbItems={[
        { label: "Chat", href: "/chat" },
        { label: sessionTitle, href: `/chat/${currentSessionId}` },
      ]}
    >
      <Chat />
    </DashboardLayout>
  );
}
