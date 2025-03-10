import { TimeframeGroupingStrategy } from "@/lib/session-grouping";
import { ChatSession, Message as MessageType } from "@/types/chat";

// groups messages by their associated chat sessions and applies timeframe grouping
// returns a map of grouped sessions with their associated messages
export function groupMessagesBySession(messages: MessageType[], sessions: ChatSession[]) {
  // create map of messages by session id
  const messagesBySessionId = new Map();
  messages.forEach((message) => {
    const sessionMessages = messagesBySessionId.get(message.chat_session_id) || [];
    sessionMessages.push(message);
    messagesBySessionId.set(message.chat_session_id, sessionMessages);
  });

  // attach messages to sessions
  const sessionsWithMessages = sessions.map((session) => ({
    ...session,
    messages: messagesBySessionId.get(session.id) || [],
  }));

  // group sessions by timeframe
  const strategy = new TimeframeGroupingStrategy();
  const groupedSessions = strategy.group(Object.values(sessionsWithMessages).flat());

  return groupedSessions;
}
