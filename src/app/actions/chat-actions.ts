"use server";

import { togglePinSession, checkQuota, duplicateSession } from "@/lib/chat/chat-utils";

/**
 * Toggles the pinned status of a chat session
 * @param sessionId The ID of the chat session to toggle pin status
 */
export async function togglePin(sessionId: string) {
  return togglePinSession(sessionId);
}

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
