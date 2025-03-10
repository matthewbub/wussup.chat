import { SupabaseClient } from "@supabase/supabase-js";

// fetches all chat related data for a user from supabase
// returns sessions, messages and user data in parallel
// throws error if any of the queries fail
export async function fetchUserChatData(supabase: SupabaseClient<any, "public", any>, userId: string) {
  try {
    const [sessionsResult, messagesResult, usersResult] = await Promise.all([
      supabase.from("ChatBot_Sessions").select("*").eq("user_id", userId),
      supabase.from("ChatBot_Messages").select("*").eq("user_id", userId).order("created_at", { ascending: true }),
      supabase
        .from("ChatBot_Users")
        .select(
          "email, message_count, stripeSubscriptionId, subscriptionStatus, user_id, subscriptionPeriodEnd, chat_context"
        )
        .eq("user_id", userId)
        .single(),
    ]);

    if (sessionsResult.error) {
      throw new Error(`Failed to fetch sessions: ${sessionsResult.error.message}`);
    }
    if (messagesResult.error) {
      throw new Error(`Failed to fetch messages: ${messagesResult.error.message}`);
    }
    if (usersResult.error) {
      throw new Error(`Failed to fetch user data: ${usersResult.error.message}`);
    }

    return { sessionsResult, messagesResult, usersResult };
  } catch (error) {
    console.error("Error fetching user chat data:", error);
    throw error;
  }
}
