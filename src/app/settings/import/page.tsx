import ImportSettings from "@/app/settings/import/_import";
import Footer from "@/components/general-footer";
import { StaticSidebar } from "@/components/sidebar";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function ImportPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
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
          <ImportSettings />
        </div>
        <Footer />
      </div>
    </div>
  );
}
