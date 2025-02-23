"use client";

import { useRouter } from "next/navigation";
import { useChatStore } from "@/stores/chatStore";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function CreateChatButton() {
  const router = useRouter();
  const { addSession, user } = useChatStore();

  const handleCreateChat = async () => {
    const sessionId = crypto.randomUUID();
    if (sessionId) {
      router.push(`/~/${sessionId}`);
    }
    // push temporary chat to the sidebar
    addSession(sessionId, user?.user_id as string);
  };

  return (
    <Button variant="outline" className="w-full justify-center" onClick={handleCreateChat}>
      <Plus className="mr-2 h-4 w-4" />
      Create Chat
    </Button>
  );
}
