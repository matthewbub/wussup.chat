import SubscriptionSettings from "./_SubscriptionPage";
import { subscriptionFacade } from "@/lib/subscription/init";
import Footer from "@/components/Footer";
import { StaticSidebar } from "@/components/sidebar";
import { auth } from "@clerk/nextjs/server";

export default async function SettingsPage() {
  const { userId } = await auth();

  const userSubscriptionInfo = await subscriptionFacade.getSubscriptionStatus(userId);
  const purchaseHistory = await subscriptionFacade.getPurchaseHistory(userId);
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
