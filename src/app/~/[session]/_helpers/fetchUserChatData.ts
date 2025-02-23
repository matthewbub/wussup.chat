import { SupabaseClient } from "@supabase/supabase-js";

export async function fetchUserChatData(
  supabase: SupabaseClient<any, "public", any>,
  userId: string
) {
  const [sessionsResult, messagesResult, usersResult] = await Promise.all([
    supabase.from("ChatBot_Sessions").select("*").eq("user_id", userId),
    supabase
      .from("ChatBot_Messages")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true }),
    supabase
      .from("ChatBot_Users")
      .select(
        "email, message_count, stripeSubscriptionId, subscriptionStatus, user_id, subscriptionPeriodEnd, chat_context"
      )
      .eq("user_id", userId)
      .single(),
  ]);

  if (sessionsResult.error || messagesResult.error || usersResult.error) {
    throw new Error("Failed to fetch user chat data");
  }

  return { sessionsResult, messagesResult, usersResult };
}
