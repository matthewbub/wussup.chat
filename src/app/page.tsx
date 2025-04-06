import { headers } from "next/headers";
import ChatAppV3 from "@/components/chat-app/chat-app";
import { getUserFromHeaders, upsertUserByIdentifier } from "@/lib/auth/auth-utils";
import { subscriptionFacade } from "@/lib/subscription/init";
import { tableNames } from "@/constants/tables";
import { supabase } from "@/lib/supabase";
import Sentry from "@sentry/nextjs";
import { formatChatHistory } from "@/lib/format/format-utils";

export default async function Home({ searchParams }: { searchParams: { session?: string } }) {
  const session = searchParams.session;
  const userInfo = await getUserFromHeaders(headers());
  const user = await upsertUserByIdentifier(userInfo);

  if ("error" in user) {
    return <div>Error: {user.error}</div>;
  }

  const [{ data: sessionsData, error: sessionsError }, { data: chatsData, error: chatsError }] = await Promise.all([
    supabase
      .from(tableNames.CHAT_SESSIONS)
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false }),
    supabase.from(tableNames.CHAT_MESSAGES).select("*").eq("user_id", user.id).eq("chat_session_id", session),
  ]);

  if (sessionsError || chatsError) {
    Sentry.captureException(sessionsError || chatsError);
    return { error: "Failed to fetch chat data" };
  }

  const formattedSessions = sessionsData?.map((session) => ({
    ...session,
    created_at: new Date(session.created_at).toISOString(),
    updated_at: new Date(session.updated_at).toISOString(),
    chat_history: formatChatHistory(chatsData?.filter((chat) => chat.chat_session_id === session.id) || []),
  }));

  const userSubscriptionInfo = await subscriptionFacade.getSubscriptionStatus(user.id);

  return <ChatAppV3 existingData={formattedSessions || []} userSubscriptionInfo={userSubscriptionInfo} />;
}
