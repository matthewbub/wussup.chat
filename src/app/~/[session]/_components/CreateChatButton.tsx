"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function CreateChatButton() {
  const router = useRouter();

  const handleCreateChat = () => {
    const newId = crypto.randomUUID();
    router.push(`/~/${newId}`);
  };

  return (
    <Button variant="outline" className="w-full justify-center" onClick={handleCreateChat}>
      <Plus className="mr-2 h-4 w-4" />
      Create Chat
    </Button>
  );
}
