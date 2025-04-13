import ExportSettings from "@/app/settings/export/_export";
import { AuthOverlay } from "@/components/auth-overlay";
import Footer from "@/components/general-footer";
import { StaticSidebar } from "@/components/sidebar";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export default async function SettingsPage() {
  const { userId } = await auth();

  // get all threads & associated messages for the user
  const threads = await prisma.thread.findMany({
    where: {
      userId: userId as string,
    },
    orderBy: {
      updatedAt: "desc",
    },
    include: {
      Message: true,
    },
  });

  console.log(threads);

  if (!userId) {
    return (
      <AuthOverlay>
        <div className="flex h-full">
          <div className="hidden md:block w-72 sticky top-0">
            <div className="inset-0 border-r border-border">
              <StaticSidebar />
            </div>
          </div>
          <div className="flex-1 w-full overflow-auto">
            <ExportSettings />
            <Footer />
          </div>
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
          <ExportSettings threads={threads} />
        </div>
        <Footer />
      </div>
    </div>
  );
}
