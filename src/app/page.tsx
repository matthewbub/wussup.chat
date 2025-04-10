import ChatApp from "@/components/chat-app/chat-app";
import { subscriptionFacade } from "@/lib/subscription/init";
import { tableNames } from "@/constants/tables";
import { supabase } from "@/lib/supabase";
import * as Sentry from "@sentry/nextjs";
import { formatChatHistory } from "@/lib/format/format-utils";
import { auth, clerkClient } from "@clerk/nextjs/server";

export default async function Home({ searchParams }: { searchParams: Promise<{ session?: string }> }) {
  const session = (await searchParams).session;
  const { userId } = await auth();

  if (!userId) {
    return <ChatApp existingData={[]} userSubscriptionInfo={null} />;
  }

  // Query for threads and the current threads messages, if applicable
  const [{ data: sessionsData, error: sessionsError }, chatsData] = await Promise.all([
    supabase.from(tableNames.CHAT_SESSIONS).select("*").eq("user_id", userId).order("updated_at", { ascending: false }),
    session
      ? supabase.from(tableNames.CHAT_MESSAGES).select("*").eq("user_id", userId).eq("chat_session_id", session)
      : null,
  ]);

  if (sessionsError || chatsData?.error) {
    Sentry.captureException(sessionsError || chatsData?.error);
    return { error: "Failed to fetch chat data" };
  }

  void updateUserMetadataIfNeeded(userId);

  const formattedSessions = sessionsData?.map((session) => ({
    ...session,
    created_at: new Date(session.created_at).toISOString(),
    updated_at: new Date(session.updated_at).toISOString(),
    chat_history: session
      ? formatChatHistory(chatsData?.data?.filter((chat) => chat.chat_session_id === session.id) || [])
      : [],
  }));

  const userSubscriptionInfo = await subscriptionFacade.getSubscriptionStatus(userId);

  return <ChatApp existingData={formattedSessions || []} userSubscriptionInfo={userSubscriptionInfo} />;
}

async function updateUserMetadataIfNeeded(userId: string) {
  const client = await clerkClient();

  // Fetch the user metadata
  const user = await client.users.getUser(userId);
  const metadata = user.publicMetadata || {};

  // Check and set the `last_day_reset` and `last_month_reset` if they don't exist
  const updates: { last_day_reset?: string; last_month_reset?: string } = {};
  const now = new Date().toISOString();

  if (!metadata.last_day_reset) {
    updates.last_day_reset = now;
  }

  if (!metadata.last_month_reset) {
    updates.last_month_reset = now;
  }

  // Update the user metadata if needed
  if (Object.keys(updates).length > 0) {
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        ...metadata,
        ...updates,
      },
    });
  }
}
