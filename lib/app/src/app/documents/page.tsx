"use client";
import { DashboardLayout } from "@/components/system/DashboardLayout";
import TipTap from "./TipTap";
import { CreateFileModal } from "./CreateFile";

export default function Page() {
  const handleCallback = (content: string) => {
    console.log(content);
  };

  return (
    <DashboardLayout
      breadcrumbItems={[
        {
          label: "Documents",
          href: "/documents",
        },
      ]}
      activePage="documents"
    >
      <TipTap className="h-[calc(100vh-56px)]" callback={handleCallback} />
      <CreateFileModal />
    </DashboardLayout>
  );
}
