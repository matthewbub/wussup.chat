// server only
import { createClient } from "./supabase-server";
import { headers } from "next/headers";
import { getUser, supabaseFacade } from "./server-utils";
import { tableNames } from "@/constants/tables";
import * as Sentry from "@sentry/nextjs";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import clsx from "clsx";
import { quotaManager } from "@/lib/quota/init";
import { checkQuotaMiddleware } from "@/lib/quota/middleware";

/**
 * A facade for handling all chat-related database operations
 */
export class ChatFacade {
  private static async getUserId(req?: Request): Promise<string> {
    const headersList = req ? req.headers : await headers();
    const user = await getUser(req ?? ({ headers: headersList } as Request));
    const userData = await supabaseFacade.getOrMakeUser(user);

    if ("error" in userData) {
      throw new Error(userData.error);
    }

    return userData.id;
  }

  /**
   * Updates a chat session's title
   */
  static async updateChatTitle(sessionId: string, title: string, req?: Request) {
    try {
      const userId = await this.getUserId(req);
      const supabase = await createClient();

      const { error } = await supabase
        .from(tableNames.CHAT_SESSIONS)
        .update({ name: title, updated_at: new Date() })
        .eq("id", sessionId)
        .eq("user_id", userId);

      if (error) {
        Sentry.captureException(error);
        return { error: "Failed to update chat title" };
      }

      return { success: true };
    } catch (error) {
      Sentry.captureException(error);
      return { error: "Failed to update chat title" };
    }
  }

  /**
   * Creates a new chat session
   */
  static async createChatSession(sessionId: string, req?: Request) {
    try {
      const userId = await this.getUserId(req);
      const supabase = await createClient();

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
  static async deleteChatSession(sessionId: string, req?: Request) {
    try {
      const userId = await this.getUserId(req);
      const supabase = await createClient();

      console.log("userId", userId);
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
  static async deleteMultipleSessions(sessionIds: string[], req?: Request) {
    try {
      const userId = await this.getUserId(req);
      const supabase = await createClient();

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
  static async storeChatMessage(
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
      const userId = await this.getUserId(req);
      const supabase = await createClient();

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
  static async getChatSessions(req?: Request) {
    try {
      const userId = await this.getUserId(req);
      const supabase = await createClient();

      const [{ data: sessionsData, error: sessionsError }, { data: chatsData, error: chatsError }] = await Promise.all([
        supabase.from(tableNames.CHAT_SESSIONS).select("*").eq("user_id", userId),
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
  static async togglePinSession(sessionId: string, req?: Request) {
    try {
      const userId = await this.getUserId(req);
      const supabase = await createClient();

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
   * Generates a title for a chat session using AI and updates it
   */
  static async generateAndUpdateTitle(sessionId: string, currentInput: string, req?: Request) {
    try {
      const { text } = await generateText({
        model: openai("gpt-4o-mini"),
        prompt: clsx([
          "You are a helpful assistant that generates a concise title for a chat session.",
          "The only context you have at this point is the user's first message.",
          "Please generate a concise title using up to 6 words.",
          "Text only, no special characters.",
          "Here's the first message: ",
          currentInput,
        ]),
      });

      console.log("text", text);

      const result = await this.updateChatTitle(sessionId, text, req);

      console.log("result", result);

      if ("error" in result) {
        console.error("error", result.error);
        return { error: result.error };
      }

      console.log("success", result.success);
      return { success: true, title: text };
    } catch (error) {
      Sentry.captureException(error);
      return { error: "Failed to generate and update chat title" };
    }
  }

  /**
   * Check if the user has exceeded their quota
   */
  static async checkQuota(req?: Request) {
    try {
      const userId = await this.getUserId(req);
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
}
