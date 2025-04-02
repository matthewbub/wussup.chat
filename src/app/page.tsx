import ChatAppV3 from "@/components/chat-app/chat-app";
import { ChatFacade } from "@/lib/chat-facade";
import * as Sentry from "@sentry/nextjs";
import { headers } from "next/headers";
import { Suspense } from "react";
import { getUserFromHeaders, supabaseFacade } from "@/lib/server-utils";
import { subscriptionFacade } from "@/lib/subscription/init";

export default async function Page() {
  const headersList = await headers();
  const userInfo = await getUserFromHeaders(headersList);
  const user = await supabaseFacade.getOrMakeUser(userInfo);

  if ("error" in user) {
    return <div>Error: {user.error}</div>;
  }
  const result = await ChatFacade.getChatSessions();
  const userSubscriptionInfo = await subscriptionFacade.getSubscriptionStatus(user.id);

  if ("error" in result) {
    Sentry.captureException(result.error);
    return (
      <div>
        <Suspense fallback={<div>Loading...</div>}>
          <ChatAppV3 existingData={[]} userSubscriptionInfo={userSubscriptionInfo} />
        </Suspense>
      </div>
    );
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChatAppV3 existingData={result.data ?? []} userSubscriptionInfo={userSubscriptionInfo} />
    </Suspense>
  );
}
