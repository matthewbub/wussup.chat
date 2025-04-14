import SubscriptionSettings from "./_SubscriptionPage";
import Footer from "@/components/general-footer";
import { StaticSidebar } from "@/components/sidebar";
import { auth } from "@clerk/nextjs/server";
import { isUserSubscribed } from "@/lib/server-utils";
import Link from "next/link";
import { AuthOverlay } from "@/components/auth-overlay";

export default async function SettingsPage() {
  const { userId } = await auth();

  const { isSubscribed, currentPeriodEnd, currentPeriodStart, cancelAtPeriodEnd } = await isUserSubscribed(
    userId as string
  );

  if (!userId) {
    return (
      <AuthOverlay>
        <div className="flex h-full">
          <div className="hidden md:block w-72 sticky top-0">
            <div className="inset-0 border-r border-border">
              <StaticSidebar />
            </div>
          </div>
          <div className="flex-1 w-full overflow-auto">{/* <Footer /> */}</div>
        </div>
      </AuthOverlay>
    );
  }

  return (
    <div className="flex h-full">
      <div className="hidden md:block w-72 sticky top-0">
        <div className="inset-0 border-r border-border">
          <StaticSidebar />
        </div>
      </div>
      <div className="flex-1 w-full overflow-auto">
        <div className="mx-auto p-6 w-full flex flex-col space-y-8">
          <SubscriptionSettings
            isSubscribed={isSubscribed}
            currentPeriodEnd={currentPeriodEnd}
            currentPeriodStart={currentPeriodStart}
            cancelAtPeriodEnd={cancelAtPeriodEnd || false}
          />

          <h2 className="text-2xl font-bold">Additional Settings and Services</h2>

          <div className="grid grid-cols-2 gap-4">
            <Link
              href="/settings/export"
              className="p-8 border border-border rounded-lg hover:bg-accent cursor-pointer"
            >
              Export Chat History
            </Link>
            <Link
              href="/settings/import"
              className="p-8 border border-border rounded-lg hover:bg-accent cursor-pointer"
            >
              Import Chat History
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}
