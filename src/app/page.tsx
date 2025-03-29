import ChatAppV3 from "@/components/ChatAppV3";
import { ChatFacade } from "@/lib/chat-facade";
import * as Sentry from "@sentry/nextjs";

export default async function Page() {
  const result = await ChatFacade.getChatSessions();

  if ("error" in result) {
    Sentry.captureException(result.error);
    return (
      <div>
        <ChatAppV3 existingData={[]} />
      </div>
    );
  }

  return <ChatAppV3 existingData={result.data ?? []} />;
}
