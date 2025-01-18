"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useChatStore } from "./chatStore";
import { useAuthStore } from "@/stores/authStore";
import { XIcon } from "lucide-react";

export const SideNav: React.FC = () => {
  const {
    sessions,
    currentSessionId,
    addSession,
    setCurrentSession,
    deleteSession,
    setSessionTitle,
  } = useChatStore();
  const { user } = useAuthStore();
  const router = useRouter();

  const handleSessionClick = (sessionId: string) => {
    setCurrentSession(sessionId);
    setSessionTitle(sessionId);
    // Update URL when changing sessions
    router.push(`?session=${sessionId}`);
  };

  return (
    <nav className="w-64 p-4 h-[calc(100vh-100px)] overflow-y-auto">
      <button
        onClick={() => {
          if (user?.id) {
            addSession(user.id);
          }
        }}
        className="w-full bg-blue-500 text-white p-2 rounded mb-4 hover:bg-blue-600 transition-colors"
      >
        New Chat
      </button>
      <ul className="space-y-2">
        {sessions.map((session) => (
          <li
            key={session.id}
            className={`flex items-center justify-between pr-1 rounded group  ${
              currentSessionId === session.id
                ? "bg-slate-800"
                : "hover:bg-slate-700"
            }`}
          >
            <button
              onClick={() => handleSessionClick(session.id)}
              className={`w-full text-left p-2 truncate text-slate-100`}
              title={session.name}
            >
              {session.name}
            </button>

            <button
              onClick={() => deleteSession(session.id)}
              className="w-fit text-left p-2 rounded text-white hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};
