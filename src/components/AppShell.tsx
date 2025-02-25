"use client";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import Link from "next/link";
import { NavUser } from "@/components/NavUser";
import { ChatTitleWidget } from "@/app/~/[session]/_components/ChatTitleWidget";
import { useChatStore } from "@/app/~/[session]/_store/chat";

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface ChatLayoutProps {
  children: React.ReactNode;
}

export function AppShell({ children }: ChatLayoutProps) {
  const { currentSession } = useChatStore();
  return (
    <SidebarInset>
      <header className="sticky top-0 flex h-14 shrink-0 items-center gap-2 bg-background z-10">
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
              {currentSession && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="line-clamp-1">
                      <ChatTitleWidget />
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              )}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="flex items-center pr-4">
          <NavUser />
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 px-4 pt-4">{children}</div>
    </SidebarInset>
  );
}
