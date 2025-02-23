import { BreadcrumbItem } from "@/components/ui/breadcrumb";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ChatSession } from "@/types/chat";
import { AppShell } from "./AppShell";

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface ChatLayoutProps {
  children: React.ReactNode;
  breadcrumbItems?: BreadcrumbItem[];
  sessions: Record<string, ChatSession[]>;
  currentSession: ChatSession;
}

export function ChatLayout({ sessions, currentSession, children }: ChatLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar sessions={sessions} currentSession={currentSession} />
      <AppShell>{children}</AppShell>
    </SidebarProvider>
  );
}
