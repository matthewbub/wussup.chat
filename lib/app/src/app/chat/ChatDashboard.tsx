"use client";

import { useEffect } from "react";
import { AuthHeader } from "@/components/system/AuthHeader";
import { Chat } from "./Chat";
import { SideNav } from "./SideNav";
import { authService } from "@/services/auth";
import { useChatStore } from "./chatStore";
import { useSearchParams } from "next/navigation";

export function ChatDashboard() {
  const { setSessions, setCurrentSession } = useChatStore();
  const searchParams = useSearchParams();
  useEffect(() => {
    async function fetchData() {
      const user = await authService.getCurrentUser();
      const response = await fetch(`/api/chat?userId=${user?.id}`);
      const data = await response.json();

      setSessions(data.sessions);

      // Set initial session from URL if present
      const sessionId = searchParams.get("session");
      if (sessionId) {
        setCurrentSession(sessionId);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-4 h-full">
      <AuthHeader />
      <div className="flex w-full">
        <SideNav />
        <div className="flex-1">
          <Chat />
        </div>
      </div>
    </div>
  );
}
