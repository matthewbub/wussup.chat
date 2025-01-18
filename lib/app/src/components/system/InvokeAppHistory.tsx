"use client";

import { useEffect } from "react";
import { authService } from "@/services/auth";
import { useChatStore } from "@/stores/chatStore";
import { useSearchParams } from "next/navigation";

export function InvokeAppHistory({ children }: { children: React.ReactNode }) {
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

  return children;
}
