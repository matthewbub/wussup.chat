"use server";

import { ChatFacade } from "@/lib/chat-facade";

/**
 * Updates a chat session title on the server
 * @param sessionId The ID of the chat session to update
 * @param title The new title for the chat session
 */
export async function updateChatTitle(sessionId: string, title: string) {
  return ChatFacade.updateChatTitle(sessionId, title);
}

/**
 * Creates a new chat session
 * @param sessionId The ID of the new chat session
 */
export async function createChatSession(sessionId: string) {
  return ChatFacade.createChatSession(sessionId);
}

/**
 * Deletes a chat session
 * @param sessionId The ID of the chat session to delete
 */
export async function deleteChatSession(sessionId: string) {
  return ChatFacade.deleteChatSession(sessionId);
}

/**
 * Deletes multiple chat sessions
 * @param sessionIds The IDs of the chat sessions to delete
 */
export async function deleteMultipleSessions(sessionIds: string[]) {
  return ChatFacade.deleteMultipleSessions(sessionIds);
}

/**
 * Gets all chat sessions for the current user
 */
export async function getChatSessions() {
  return ChatFacade.getChatSessions();
}

/**
 * Toggles the pinned status of a chat session
 * @param sessionId The ID of the chat session to toggle pin status
 */
export async function togglePinSession(sessionId: string) {
  return ChatFacade.togglePinSession(sessionId);
}

/**
 * Generates a title for a chat session using AI and updates it
 * @param sessionId The ID of the chat session
 * @param currentInput The current user input to base the title on
 */
export async function generateAndUpdateTitle(sessionId: string, currentInput: string) {
  return ChatFacade.generateAndUpdateTitle(sessionId, currentInput);
}
