import { Chat } from "./Chat";
import { DashboardLayout } from "@/components/system/DashboardLayout";

export default function Page() {
  return (
    <DashboardLayout
      activePage="chat"
      breadcrumbItems={[
        { label: "Chat", href: "/chat" },
        // TODO: Add chat title here
        // { label: "Project Management & Task Tracking" },
      ]}
    >
      <Chat />
    </DashboardLayout>
  );
}
