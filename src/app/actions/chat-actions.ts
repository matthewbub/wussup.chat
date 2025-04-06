"use server";

import {
  updateChatTitle,
  createChatSession,
  deleteChatSession,
  deleteMultipleSessions,
  getChatSessions,
  togglePinSession,
  generateAndUpdateTitle,
  checkQuota,
  duplicateSession,
} from "@/lib/chat/chat-utils";

/**
 * Updates a chat session title on the server
 * @param sessionId The ID of the chat session to update
 * @param title The new title for the chat session
 */
export async function updateTitle(sessionId: string, title: string) {
  return updateChatTitle(sessionId, title);
}

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
 * Generates a title for a chat session using AI and updates it
 * @param sessionId The ID of the chat session
 * @param currentInput The current user input to base the title on
 */
export async function generateTitle(sessionId: string, currentInput: string) {
  return generateAndUpdateTitle(sessionId, currentInput);
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
