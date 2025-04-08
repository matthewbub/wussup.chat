import { getUserId } from "@/lib/chat/chat-utils";
import { supabase } from "@/lib/supabase";
import { tableNames } from "@/constants/tables";
import * as Sentry from "@sentry/nextjs";

/**
 * Duplicates a chat session and all its messages
 */
export async function POST(req: Request) {
  try {
    const userId = await getUserId(req);
    const { sessionId, newSessionId } = await req.json();

    // Get the session to duplicate
    const { data: session, error: sessionError } = await supabase
      .from(tableNames.CHAT_SESSIONS)
      .select("name")
      .eq("id", sessionId)
      .eq("user_id", userId)
      .single();

    if (sessionError) {
      Sentry.captureException(sessionError);
      return { error: "Failed to fetch chat session" };
    }

    // Get all messages from the original session
    const { data: messages, error: messagesError } = await supabase
      .from(tableNames.CHAT_MESSAGES)
      .select("*")
      .eq("chat_session_id", sessionId)
      .eq("user_id", userId);

    if (messagesError) {
      Sentry.captureException(messagesError);
      return { error: "Failed to fetch chat messages" };
    }

    const newSessionName = `${session?.name || "Chat"} (copy)`;
    const { error: newSessionError } = await supabase.from(tableNames.CHAT_SESSIONS).insert({
      id: newSessionId,
      user_id: userId,
      name: newSessionName,
    });

    if (newSessionError) {
      Sentry.captureException(newSessionError);
      return { error: "Failed to create new chat session" };
    }

    // Duplicate all messages with the new session ID
    if (messages && messages.length > 0) {
      const newMessages = messages.map((msg) => ({
        ...msg,
        id: crypto.randomUUID(),
        chat_session_id: newSessionId,
        created_at: new Date(),
      }));

      const { error: newMessagesError } = await supabase.from(tableNames.CHAT_MESSAGES).insert(newMessages);

      if (newMessagesError) {
        // If message copy fails, delete the new session to maintain consistency
        await supabase.from(tableNames.CHAT_SESSIONS).delete().eq("id", newSessionId);
        Sentry.captureException(newMessagesError);
        return { error: "Failed to copy chat messages" };
      }
    }

    return { success: true, sessionId: newSessionId, name: newSessionName };
  } catch (error) {
    Sentry.captureException(error);
    return { error: "Failed to duplicate chat session" };
  }
}
