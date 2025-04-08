"use server";

import { checkQuota, duplicateSession } from "@/lib/chat/chat-utils";

/**
 * Checks if the user has exceeded their quota
 */
export async function checkUserQuota() {
  return checkQuota();
}

/**
 * Duplicates a chat session and all its messages
 * @param sessionId The ID of the chat session to duplicate
 */
export async function duplicateChat(sessionId: string) {
  return duplicateSession(sessionId);
}
