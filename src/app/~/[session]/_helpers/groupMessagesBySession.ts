import { TimeframeGroupingStrategy } from "@/lib/session-grouping";
import { Message as MessageType } from "@/types/chat";

export function groupMessagesBySession(
  messages: MessageType[],
  sessions: any[]
) {
  // create map of messages by session id
  const messagesBySessionId = new Map();
  messages.forEach((message) => {
    const sessionMessages =
      messagesBySessionId.get(message.chat_session_id) || [];
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
  return strategy.group(Object.values(sessionsWithMessages).flat());
}
