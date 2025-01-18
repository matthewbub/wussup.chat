"use client";

import { useEffect } from "react";
import { authService } from "@/services/auth";
import { useChatStore } from "@/stores/chatStore";
import { useSearchParams } from "next/navigation";

export function InvokeAppHistory({ children }: { children: React.ReactNode }) {
  const { fetchSessions, setCurrentSession } = useChatStore();
  const searchParams = useSearchParams();

  useEffect(() => {
    async function initializeChat() {
      const user = await authService.getCurrentUser();
      if (user) {
        await fetchSessions(user.id);

        // Set initial session from URL if present
        const sessionId = searchParams.get("session");
        if (sessionId) {
          setCurrentSession(sessionId);
        }
      }
    }

    initializeChat();
  }, []);

  return children;
}
