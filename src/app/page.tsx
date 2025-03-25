import { headers } from "next/headers";
import ChatAppV3 from "@/components/ChatAppV3";
import { getUserFromHeaders, supabaseFacade } from "@/lib/server-utils";
import { createClient } from "@/lib/supabase-server";
import * as Sentry from "@sentry/nextjs";

export default async function Page() {
  // if ur signed in we use ur user id
  const headersList = await headers();
  // otherwise we snatch ur ip addy and make that the user id
  const user = await getUserFromHeaders(headersList);
  const supabase = await createClient();
  const userData = await supabaseFacade.getOrMakeUser(user);

  if ("error" in userData) {
    // just return the app anyway .... it might fail idk but theres a chance it owrks on the nexxt round ?
    Sentry.captureException(userData.error);
    return (
      <div>
        <ChatAppV3 existingData={[]} />
      </div>
    );
  }

  const [{ data: sessionsData, error: sessionsError }, { data: chatsData, error: chatsError }] = await Promise.all([
    supabase
      .from("ChatSessions")
      .select("*")
      .eq("user_id", userData?.id as string),
    supabase
      .from("Chats")
      .select("*")
      .eq("user_id", userData?.id as string),
  ]);

  if (sessionsError || chatsError) {
    // trigger sentry error
    Sentry.captureException(sessionsError || chatsError);
  }

  const formattedSessionsData = sessionsData?.map((session) => ({
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
      }, []),
  }));

  return <ChatAppV3 existingData={formattedSessionsData} />;
}
