import { headers } from "next/headers";
import ChatAppV3 from "@/components/chat-app/chat-app";
import { getChatSessions } from "@/lib/chat/chat-utils";
import { getUserFromHeaders, upsertUserByIdentifier } from "@/lib/auth/auth-utils";
import { subscriptionFacade } from "@/lib/subscription/init";

export default async function Home() {
  const userInfo = await getUserFromHeaders(headers());
  const user = await upsertUserByIdentifier(userInfo);

  if ("error" in user) {
    return <div>Error: {user.error}</div>;
  }

  const result = await getChatSessions();
  const userSubscriptionInfo = await subscriptionFacade.getSubscriptionStatus(user.id);

  return <ChatAppV3 existingData={result.data || []} userSubscriptionInfo={userSubscriptionInfo} />;
}
