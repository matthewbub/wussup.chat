"use client";

import { useRouter } from "next/navigation";
import { AuthWrapper, AuthHeader } from "@ninembs-studio/system-ui";
import { ChatHistory } from "@/components/ChatHistory";

export default function Dashboard() {
  const router = useRouter();
  return (
    <AuthWrapper history={router}>
      <div className="max-w-6xl mx-auto p-4 h-full">
        <AuthHeader />
        <ChatHistory />
      </div>
    </AuthWrapper>
  );
}
