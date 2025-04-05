import SubscriptionSettings from "./_SubscriptionPage";
import { getUserFromHeaders } from "@/lib/server-utils";
import { subscriptionFacade } from "@/lib/subscription/init";
import { headers } from "next/headers";
import Footer from "@/components/Footer";
import { StaticSidebar } from "@/components/sidebar";
import { upsertUserByIdentifier } from "@/lib/server-utils";

export default async function Page() {
  const headersList = await headers();
  const userInfo = await getUserFromHeaders(headersList);
  const user = await upsertUserByIdentifier(userInfo);

  if ("error" in user) {
    return <div>Error: {user.error}</div>;
  }

  const userSubscriptionInfo = await subscriptionFacade.getSubscriptionStatus(user.id);
  const purchaseHistory = await subscriptionFacade.getPurchaseHistory(user.id);
  const formattedPurchaseHistory = purchaseHistory.map((purchase) => ({
    ...purchase,
    purchase_date: new Date(purchase.purchase_date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
    plan_name: subscriptionFacade.getPlanFromPriceId(purchase.price_id),
  }));

  return (
    <div className="flex h-full">
      <div className="hidden md:block w-72 sticky top-0">
        <div className="inset-0 border-r border-border">
          <StaticSidebar />
        </div>
      </div>
      <div className="flex-1 w-full overflow-auto">
        <div className="mx-auto p-6 w-full flex flex-col">
          <SubscriptionSettings
            userSubscriptionInfo={userSubscriptionInfo}
            purchaseHistory={formattedPurchaseHistory}
          />
        </div>
        <Footer />
      </div>
    </div>
  );
}
