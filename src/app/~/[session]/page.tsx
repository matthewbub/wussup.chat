import { ChatLayout } from "@/components/DashboardLayout";
import { createClient } from "@/lib/supabase-server";
import ChatApp from "./_components/ChatApp";
import { groupMessagesBySession } from "./_helpers/groupMessagesBySession";
import { ensureUserStorageFolder } from "./_helpers/ensureUserStorageFolder";
import { fetchUserChatData } from "./_helpers/fetchUserChatData";
import { isSubscriptionActive } from "./_helpers/isSubscriptionActive";

export default async function Page({ params }: { params: { session: string } }) {
  const supabase = await createClient();
  const appParams = await params;
  const sessionId = appParams.session;
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;
  if (!userId) {
    return <div>Not logged in</div>;
  }
  await ensureUserStorageFolder(supabase, userId); // ensure user storage folder exists & create if it doesn't
  const { sessionsResult, messagesResult, usersResult } = await fetchUserChatData(supabase, userId); // fetch user chat data
  const groupedSessions = groupMessagesBySession(messagesResult.data, sessionsResult.data); // group messages by session
  const currentSession = sessionsResult.data.find((session) => session.id === sessionId); // find current session
  const subscriptionEndDate = usersResult.data?.subscriptionPeriodEnd; // check if subscription is active
  const isUserSubscribed = isSubscriptionActive(subscriptionEndDate);

  return (
    <ChatLayout sessions={groupedSessions} currentSessionId={currentSession?.id}>
      <ChatApp isUserSubscribed={isUserSubscribed} sessionId={sessionId} />
    </ChatLayout>
  );
}
