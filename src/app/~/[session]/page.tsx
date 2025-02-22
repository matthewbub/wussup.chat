import { ChatLayout } from "@/components/DashboardLayout";
import { createClient } from "@/lib/supabase-server";
import { Message } from "./_components/Message";
import { Message as MessageType } from "@/types/chat";
import ChatInput from "./_components/ChatInput";
import { groupMessagesBySession } from "./_helpers/groupMessagesBySession";

export default async function Page({
  params,
}: {
  params: { session: string };
}) {
  const supabase = await createClient();
  const sessionId = await params.session;

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    // redirect("/");
    return <div>Not logged in</div>;
  }

  const userId = userData.user.id;

  // Ensure user folder exists within ChatBot_Images_Generated bucket
  const { data: folderList, error: listError } = await supabase.storage
    .from("ChatBot_Images_Generated")
    .list(userId);

  if (listError) {
    throw new Error(`Failed to check user folder: ${listError.message}`);
  }

  if (!folderList || folderList.length === 0) {
    // Create an empty .keep file to initialize the folder
    const { error: createError } = await supabase.storage
      .from("ChatBot_Images_Generated")
      .upload(`${userId}/.keep`, new Blob([""]));

    if (createError) {
      throw new Error(`Failed to create user folder: ${createError.message}`);
    }
  }

  // TODO: Move this to RPC
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

  if (sessionsResult.error || messagesResult.error) {
    // todo: response with something better
    throw new Error("Failed to fetch data");
  }

  const groupedSessions = groupMessagesBySession(
    messagesResult.data,
    sessionsResult.data
  );

  const currentSession = sessionsResult.data.find(
    (session) => session.id === sessionId
  );

  return (
    <ChatLayout sessions={groupedSessions} currentSessionId={currentSession.id}>
      {currentSession &&
        currentSession?.messages?.map((message: MessageType) => (
          <Message
            key={message.id}
            message={message}
            createdAt={message.created_at}
            fullMessage={message}
          />
        ))}

      <ChatInput />
    </ChatLayout>
  );
}
