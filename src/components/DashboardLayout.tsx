import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import Link from "next/link";
import { NavUser } from "@/components/NavUser";
import { ChatSession } from "@/types/chat";

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface ChatLayoutProps {
  children: React.ReactNode;
  breadcrumbItems?: BreadcrumbItem[];
  sessions: Record<string, ChatSession[]>;
  currentSessionId: string;
}

export function ChatLayout({
  sessions,
  currentSessionId,
  children,
}: ChatLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar sessions={sessions} currentSessionId={currentSessionId} />
      <SidebarInset>
        <header className="sticky top-0 flex h-14 shrink-0 items-center gap-2 bg-background">
          <div className="flex flex-1 items-center gap-2 px-3">
            <SidebarTrigger />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage className="line-clamp-1">
                    <Link href="/">Chat</Link>
                  </BreadcrumbPage>
                </BreadcrumbItem>
                {/* {currentSessionId && (
                  <>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage className="line-clamp-1">
                        <ChatTitleWidget />
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  </>
                )} */}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="flex items-center pr-4">
            <NavUser />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 px-4 pt-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
