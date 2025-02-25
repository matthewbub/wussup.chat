import { BreadcrumbItem } from "@/components/ui/breadcrumb";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ChatSession } from "@/types/chat";
import { User } from "@/types/user";
import { AppShell } from "@/components/AppShell";

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface ChatLayoutProps {
  children: React.ReactNode;
  breadcrumbItems?: BreadcrumbItem[];
  sessions: Record<string, ChatSession[]>;
  currentSession: ChatSession;
  user: User;
}

export function ChatLayout({ sessions, children }: ChatLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar sessions={sessions} />
      <AppShell>{children}</AppShell>
    </SidebarProvider>
  );
}
