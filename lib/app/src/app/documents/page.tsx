"use client";
import { DashboardLayout } from "@/components/system/DashboardLayout";
import TipTap from "./TipTap";

export default function Page() {
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
      <TipTap className="h-[calc(100vh-56px)]" />
    </DashboardLayout>
  );
}
