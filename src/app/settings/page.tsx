import { getUserFromHeaders, supabaseFacade } from "@/lib/server-utils";
import SettingsPage from "./_components/SettingsPage";
import { subscriptionFacade } from "@/lib/subscription/init";
import { headers } from "next/headers";

export default async function Page() {
  const headersList = await headers();
  const userInfo = await getUserFromHeaders(headersList);
  const user = await supabaseFacade.getOrMakeUser(userInfo);

  if ("error" in user) {
    return <div>Error: {user.error}</div>;
  }

  const status = await subscriptionFacade.getSubscriptionStatus(user.id);
  console.log("status", status);
  return <SettingsPage status={status} />;
}
