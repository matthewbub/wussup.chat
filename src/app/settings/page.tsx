import SubscriptionSettings from "./_SubscriptionPage";
import Footer from "@/components/Footer";
import { StaticSidebar } from "@/components/sidebar";
import { auth } from "@clerk/nextjs/server";
import { isUserSubscribed } from "@/lib/server-utils";

export default async function SettingsPage() {
  const { userId } = await auth();

  const { isSubscribed, currentPeriodEnd, currentPeriodStart, cancelAtPeriodEnd } = await isUserSubscribed(
    userId as string
  );

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
            isSubscribed={isSubscribed}
            currentPeriodEnd={currentPeriodEnd}
            currentPeriodStart={currentPeriodStart}
            cancelAtPeriodEnd={cancelAtPeriodEnd || false}
          />
        </div>
        <Footer />
      </div>
    </div>
  );
}
