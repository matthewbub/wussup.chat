import { ChatLayout } from "@/components/DashboardLayout";
import { createClient } from "@/lib/supabase-server";
import ChatApp from "./_components/ChatApp";
import { groupMessagesBySession } from "./_helpers/groupMessagesBySession";
import { ensureUserStorageFolder } from "./_helpers/ensureUserStorageFolder";
import { fetchUserChatData } from "./_helpers/fetchUserChatData";
import { redirect } from "next/navigation";
import { User } from "@/types/user";
import { ChatSession, Message } from "@/types/chat";
import { generateCurrentSessionPlaceholder } from "./_helpers/currentSessionPlaceholder";
import { AppState } from "@/components/AppState";
import { Background } from "@/components/ui/Background";

type DBMessage = {
  id: string;
  content: string;
  is_user: boolean;
  response_group_id: string | null;
  parent_message_id: string | null;
  response_type: "A" | "B" | null;
  model: string;
  created_at: string;
};

export default async function Page({ params }: { params: Promise<{ session: string }> }) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;
  if (!userId) {
    return redirect(`/`);
  }

  const appParams = await params;
  const sessionId = appParams.session;
  if (!sessionId) {
    return redirect(`/~/${crypto.randomUUID()}`);
  }

  await ensureUserStorageFolder(supabase, userId); // ensure user storage folder exists & create if it doesn't
  const { sessionsResult, messagesResult, usersResult } = await fetchUserChatData(supabase, userId); // fetch user chat data
  const sessionExists = sessionsResult.data?.find((session) => session.id === sessionId);
  const sessions = [
    ...sessionsResult.data,
    !sessionExists && generateCurrentSessionPlaceholder(sessionId, sessionsResult.data.length, userId),
  ];
  const groupedSessions = groupMessagesBySession(messagesResult.data, sessions); // group messages by session
  const currentSession = [...Object.values(groupedSessions).flat()].find((session) => session.id === sessionId);
  const initialMessages =
    (currentSession?.messages as unknown as DBMessage[])?.map((message) => ({
      id: message.id,
      content: message.content,
      is_user: message.is_user,
      created_at: message.created_at,
      model: message.model || "",
      responseType: message.response_type,
      responseGroupId: message.response_group_id,
      parentMessageId: message.parent_message_id,
    })) || [];

  return (
    <Background>
      <AppState user={usersResult.data as unknown as User} currentSession={currentSession as ChatSession}>
        <ChatLayout sessions={groupedSessions}>
          <ChatApp sessionId={sessionId} initialMessages={initialMessages as Message[]} />
        </ChatLayout>
      </AppState>
    </Background>
  );
}
