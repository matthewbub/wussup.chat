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
