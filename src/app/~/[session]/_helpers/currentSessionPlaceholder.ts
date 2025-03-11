import { ChatSession } from "@/types/chat";

// generates a placeholder chat session for new conversations
export function generateCurrentSessionPlaceholder(
  sessionId: string,
  numberOfChats: number,
  userId: string
): ChatSession {
  return {
    id: sessionId,
    name: `Untitled Chat ${numberOfChats + 1}`,
    messages: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    clerk_user_id: userId,
  };
}
