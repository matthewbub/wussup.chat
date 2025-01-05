"use client";

import { AuthWrapper } from "@/components/AuthWrapper";
import { AuthHeader } from "@/components/AuthHeader";
import { ChatHistory } from "@/components/ChatHistory";
import { ChatNav } from "@/components/ChatNav";
import { useState } from "react";

export default function Dashboard() {
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

  return (
    <AuthWrapper>
      <div className="max-w-6xl mx-auto p-4">
        <AuthHeader />
        <div className="mt-8 flex gap-6 h-[600px]">
          <ChatNav
            currentFolderId={currentFolderId}
            onFolderSelect={setCurrentFolderId}
          />
          <div className="flex-1">
            <ChatHistory folderId={currentFolderId} />
          </div>
        </div>
      </div>
    </AuthWrapper>
  );
}
