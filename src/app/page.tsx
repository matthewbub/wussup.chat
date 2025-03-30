import ChatAppV3 from "@/components/ChatAppV3";
import { ChatFacade } from "@/lib/chat-facade";
import * as Sentry from "@sentry/nextjs";
import { Suspense } from "react";

export default async function Page() {
  const result = await ChatFacade.getChatSessions();

  if ("error" in result) {
    Sentry.captureException(result.error);
    return (
      <div>
        <Suspense fallback={<div>Loading...</div>}>
          <ChatAppV3 existingData={[]} />
        </Suspense>
      </div>
    );
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChatAppV3 existingData={result.data ?? []} />
    </Suspense>
  );
}
