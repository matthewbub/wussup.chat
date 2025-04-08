// server only
import { supabase } from "@/lib/supabase";
import { headers } from "next/headers";
import { getUser, upsertUserByIdentifier } from "@/lib/auth/auth-utils";
import { tableNames } from "@/constants/tables";
import * as Sentry from "@sentry/nextjs";
import { quotaManager } from "@/lib/quota/init";
import { checkQuotaMiddleware } from "@/lib/quota/middleware";

/**
 * Gets the user ID from the request or headers
 */
export async function getUserId(req?: Request): Promise<string> {
  const headersList = req ? req.headers : await headers();
  const user = await getUser(req ?? ({ headers: headersList } as Request));
  const userData = await upsertUserByIdentifier(user);

  if ("error" in userData) {
    throw new Error(userData.error);
  }

  return userData.id;
}

/**
 * Creates a new chat session
 */
export async function createChatSession(sessionId: string, req?: Request) {
  try {
    const userId = await getUserId(req);

    const { error } = await supabase.from(tableNames.CHAT_SESSIONS).insert({
      id: sessionId,
      user_id: userId,
      name: "New Chat",
    });

    if (error) {
      Sentry.captureException(error);
      return { error: "Failed to create chat session" };
    }

    return { success: true };
  } catch (error) {
    Sentry.captureException(error);
    return { error: "Failed to create chat session" };
  }
}

/**
 * Deletes a chat session and all its messages
 */
export async function deleteChatSession(sessionId: string, req?: Request) {
  try {
    const userId = await getUserId(req);

    // Delete all messages first due to foreign key constraint
    const { error: messagesError } = await supabase
      .from(tableNames.CHAT_MESSAGES)
      .delete()
      .eq("chat_session_id", sessionId)
      .eq("user_id", userId);

    if (messagesError) {
      Sentry.captureException(messagesError);
      return { error: "Failed to delete chat messages" };
    }

    // Then delete the session
    const { error: sessionError } = await supabase
      .from(tableNames.CHAT_SESSIONS)
      .delete()
      .eq("id", sessionId)
      .eq("user_id", userId);

    if (sessionError) {
      Sentry.captureException(sessionError);
      return { error: "Failed to delete chat session" };
    }

    return { success: true };
  } catch (error) {
    Sentry.captureException(error);
    return { error: "Failed to delete chat session" };
  }
}

/**
 * Deletes multiple chat sessions and their messages
 */
export async function deleteMultipleSessions(sessionIds: string[], req?: Request) {
  try {
    const userId = await getUserId(req);

    // Delete all messages first due to foreign key constraint
    const { error: messagesError } = await supabase
      .from(tableNames.CHAT_MESSAGES)
      .delete()
      .in("chat_session_id", sessionIds)
      .eq("user_id", userId);

    if (messagesError) {
      Sentry.captureException(messagesError);
      return { error: "Failed to delete chat messages" };
    }

    // Then delete the sessions
    const { error: sessionError } = await supabase
      .from(tableNames.CHAT_SESSIONS)
      .delete()
      .in("id", sessionIds)
      .eq("user_id", userId);

    if (sessionError) {
      Sentry.captureException(sessionError);
      return { error: "Failed to delete chat sessions" };
    }

    return { success: true };
  } catch (error) {
    Sentry.captureException(error);
    return { error: "Failed to delete chat sessions" };
  }
}

/**
 * Stores a chat message
 */
export async function storeChatMessage(
  sessionId: string,
  message: {
    model: string;
    input: string;
    output: string;
    prompt_tokens: number;
    completion_tokens: number;
  },
  req?: Request
) {
  try {
    const userId = await getUserId(req);
    // Ensure session exists
    const { error: sessionError } = await supabase.from(tableNames.CHAT_SESSIONS).upsert({
      id: sessionId,
      user_id: userId,
    });

    if (sessionError) {
      Sentry.captureException(sessionError);
      return { error: "Failed to ensure chat session exists" };
    }

    // Store the message
    const { error: messageError } = await supabase.from(tableNames.CHAT_MESSAGES).insert({
      chat_session_id: sessionId,
      user_id: userId,
      model: message.model,
      input: message.input,
      output: message.output,
      prompt_tokens: message.prompt_tokens,
      completion_tokens: message.completion_tokens,
    });

    if (messageError) {
      Sentry.captureException(messageError);
      return { error: "Failed to store chat message" };
    }

    return { success: true };
  } catch (error) {
    Sentry.captureException(error);
    return { error: "Failed to store chat message" };
  }
}

/**
 * Gets all chat sessions for a user
 */
export async function getChatSessions(req?: Request) {
  try {
    const userId = await getUserId(req);

    const [{ data: sessionsData, error: sessionsError }, { data: chatsData, error: chatsError }] = await Promise.all([
      supabase
        .from(tableNames.CHAT_SESSIONS)
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false }),
      supabase.from(tableNames.CHAT_MESSAGES).select("*").eq("user_id", userId),
    ]);

    if (sessionsError || chatsError) {
      Sentry.captureException(sessionsError || chatsError);
      return { error: "Failed to fetch chat data" };
    }

    const formattedSessions = sessionsData?.map((session) => ({
      ...session,
      created_at: new Date(session.created_at).toISOString(),
      updated_at: new Date(session.updated_at).toISOString(),
      chat_history: chatsData
        ?.filter((chat) => chat.chat_session_id === session.id)
        .reduce((acc, chat) => {
          const userMessage = {
            role: "user",
            content: chat.input,
          };
          const aiMessage = {
            role: "assistant",
            content: chat.output,
          };
          return [...acc, userMessage, aiMessage];
        }, [] as { role: string; content: string }[]),
    }));

    return { data: formattedSessions };
  } catch (error) {
    Sentry.captureException(error);
    return { error: "Failed to fetch chat sessions" };
  }
}

/**
 * Toggles the pinned status of a chat session
 */
export async function togglePinSession(sessionId: string, req?: Request) {
  try {
    const userId = await getUserId(req);

    // First get the current pinned status
    const { data: session, error: fetchError } = await supabase
      .from(tableNames.CHAT_SESSIONS)
      .select("pinned")
      .eq("id", sessionId)
      .eq("user_id", userId)
      .single();

    if (fetchError) {
      Sentry.captureException(fetchError);
      return { error: "Failed to fetch chat session" };
    }

    // Toggle the pinned status
    const { error: updateError } = await supabase
      .from(tableNames.CHAT_SESSIONS)
      .update({
        pinned: !session?.pinned,
        updated_at: new Date(),
      })
      .eq("id", sessionId)
      .eq("user_id", userId);

    if (updateError) {
      Sentry.captureException(updateError);
      return { error: "Failed to update pinned status" };
    }

    return { success: true, pinned: !session?.pinned };
  } catch (error) {
    Sentry.captureException(error);
    return { error: "Failed to toggle pin status" };
  }
}

/**
 * Check if the user has exceeded their quota
 */
export async function checkQuota(req?: Request) {
  try {
    const userId = await getUserId(req);
    const quotaError = await checkQuotaMiddleware(userId, quotaManager);

    if (quotaError) {
      return { error: "Quota exceeded" };
    }

    return { success: true };
  } catch (error) {
    Sentry.captureException(error);
    return { error: "Failed to check quota" };
  }
}

/**
 * Duplicates a chat session and all its messages
 */
export async function duplicateSession(sessionId: string, req?: Request) {
  try {
    const userId = await getUserId(req);

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

    // Create new session
    const newSessionId = crypto.randomUUID();
    const { error: newSessionError } = await supabase.from(tableNames.CHAT_SESSIONS).insert({
      id: newSessionId,
      user_id: userId,
      name: `${session?.name || "Chat"} (copy)`,
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

    return { success: true, sessionId: newSessionId };
  } catch (error) {
    Sentry.captureException(error);
    return { error: "Failed to duplicate chat session" };
  }
}
