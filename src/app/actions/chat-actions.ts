"use server";

import {
  createChatSession,
  deleteChatSession,
  deleteMultipleSessions,
  getChatSessions,
  togglePinSession,
  checkQuota,
  duplicateSession,
} from "@/lib/chat/chat-utils";

/**
 * Creates a new chat session
 * @param sessionId The ID of the new chat session
 */
export async function createSession(sessionId: string) {
  return createChatSession(sessionId);
}

/**
 * Deletes a chat session
 * @param sessionId The ID of the chat session to delete
 */
export async function deleteSession(sessionId: string) {
  return deleteChatSession(sessionId);
}

/**
 * Deletes multiple chat sessions
 * @param sessionIds The IDs of the chat sessions to delete
 */
export async function deleteSessions(sessionIds: string[]) {
  return deleteMultipleSessions(sessionIds);
}

/**
 * Gets all chat sessions for the current user
 */
export async function getSessions() {
  return getChatSessions();
}

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
