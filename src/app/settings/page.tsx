import SubscriptionSettings from "./_SubscriptionPage";
import { getUserFromHeaders, supabaseFacade } from "@/lib/server-utils";
import { subscriptionFacade } from "@/lib/subscription/init";
import { headers } from "next/headers";
import PublicHeader from "@/components/PublicHeader";
import Footer from "@/components/Footer";
import { IconSidebar } from "@/components/IconSidebar";

export default async function Page() {
  const headersList = await headers();
  const userInfo = await getUserFromHeaders(headersList);
  const user = await supabaseFacade.getOrMakeUser(userInfo);

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
    <div className="h-full flex flex-col">
      <div className="flex">
        <IconSidebar />
        <div className="flex-1">
          <PublicHeader />
          <SubscriptionSettings
            userSubscriptionInfo={userSubscriptionInfo}
            purchaseHistory={formattedPurchaseHistory}
          />
        </div>
      </div>
      <Footer />
    </div>
  );
}
