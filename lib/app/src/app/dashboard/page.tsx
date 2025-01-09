"use client";

import { AuthWrapper } from "@/components/AuthWrapper";
import { AuthHeader } from "@/components/AuthHeader";
import { ChatHistory } from "@/components/ChatHistory";

export default function Dashboard() {
  return (
    <AuthWrapper>
      <div className="max-w-6xl mx-auto p-4">
        <AuthHeader />
        <ChatHistory />
      </div>
    </AuthWrapper>
  );
}
