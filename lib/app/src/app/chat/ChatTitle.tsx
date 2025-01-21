"use client";

import React from "react";
import { useChatStore } from "@/stores/chatStore";

export const ChatTitle: React.FC = () => {
  const { sessionTitle } = useChatStore();

  return (
    <>
      {sessionTitle && (
        <div className="flex items-center justify-between px pb-4 bg-background">
          <h1 className="text-2xl font-bold">{sessionTitle}</h1>
        </div>
      )}
    </>
  );
};
