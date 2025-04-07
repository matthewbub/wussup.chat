import { headers } from "next/headers";
import ChatAppV3 from "@/components/chat-app/chat-app";
import { getUserFromHeaders, upsertUserByIdentifier } from "@/lib/auth/auth-utils";
import { subscriptionFacade } from "@/lib/subscription/init";
import { tableNames } from "@/constants/tables";
import { supabase } from "@/lib/supabase";
import Sentry from "@sentry/nextjs";
import { formatChatHistory } from "@/lib/format/format-utils";

export default async function Home({ searchParams }: { searchParams: Promise<{ session?: string }> }) {
  const session = (await searchParams).session;
  const userInfo = await getUserFromHeaders(headers());
  const user = await upsertUserByIdentifier(userInfo);

  if ("error" in user) {
    return <div>Error: {user.error}</div>;
  }

  const [{ data: sessionsData, error: sessionsError }, chatsData] = await Promise.all([
    supabase
      .from(tableNames.CHAT_SESSIONS)
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false }),
    session
      ? supabase.from(tableNames.CHAT_MESSAGES).select("*").eq("user_id", user.id).eq("chat_session_id", session)
      : null,
  ]);

  if (sessionsError || chatsData?.error) {
    Sentry.captureException(sessionsError || chatsData?.error);
    return { error: "Failed to fetch chat data" };
  }

  const formattedSessions = sessionsData?.map((session) => ({
    ...session,
    created_at: new Date(session.created_at).toISOString(),
    updated_at: new Date(session.updated_at).toISOString(),
    chat_history: session
      ? formatChatHistory(chatsData?.data?.filter((chat) => chat.chat_session_id === session.id) || [])
      : [],
  }));

  const userSubscriptionInfo = await subscriptionFacade.getSubscriptionStatus(user.id);

  return <ChatAppV3 existingData={formattedSessions || []} userSubscriptionInfo={userSubscriptionInfo} />;
}
