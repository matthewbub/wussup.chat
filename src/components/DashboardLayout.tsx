import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ChatSession } from "@/types/chat";
import { AppShell } from "@/components/AppShell";

interface ChatLayoutProps {
  children: React.ReactNode;
  sessions: Record<string, ChatSession[]>;
}

export function ChatLayout({ sessions, children }: ChatLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar sessions={sessions} />
      <AppShell>{children}</AppShell>
    </SidebarProvider>
  );
}
