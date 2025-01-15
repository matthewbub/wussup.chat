import { AuthWrapper } from "@/components/system/AuthWrapper";
import { ChatDashboard } from "./ChatDashboard";

export default function Dashboard() {
  return (
    <AuthWrapper>
      <ChatDashboard />
    </AuthWrapper>
  );
}
