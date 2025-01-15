"use client";

import { useEffect, useState } from "react";
import { AuthHeader } from "@/components/system/AuthHeader";
import { Chat } from "./Chat";
import { SideNav } from "./SideNav";
import { ChatSession } from "./chatTypes";
import { authService } from "@/services/auth";

export function ChatDashboard() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const user = await authService.getCurrentUser();
      const response = await fetch(`/api/chat?userId=${user?.id}`);
      const data = await response.json();

      setSessions(data.sessions);
      setMessages(data.messages);
      console.log(data);
    }

    fetchData();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-4 h-full">
      <AuthHeader />
      <div className="flex w-full">
        <SideNav sessions={sessions} />
        <div className="flex-1">
          <Chat />
        </div>
      </div>
    </div>
  );
}
