"use client";
import { User } from "@/types/user";
import { ChatSession } from "@/types/chat";
import { useChatStore } from "@/app/~/[session]/_store/chat";
import { useEffect } from "react";

export function AppState({
  user,
  currentSession,
  children,
}: {
  user: User;
  currentSession: ChatSession;
  children: React.ReactNode;
}) {
  const { setCurrentSession, setUser } = useChatStore();

  useEffect(() => {
    setUser(user);
    setCurrentSession(currentSession);
  }, []);

  return <>{children}</>;
}
