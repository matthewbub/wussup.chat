import { AuthWrapper } from "@/components/system/AuthWrapper";
import { InvokeAppHistory } from "./InvokeAppHistory";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { NavBarItems } from "@/components/system/sidenav/NavBarItems";
import Link from "next/link";
import { NavUser } from "../nav-user";

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  breadcrumbItems?: BreadcrumbItem[];
  activePage?: "chat" | "documents" | "settings";
}

export function DashboardLayout({
  children,
  activePage,
  breadcrumbItems = [],
}: DashboardLayoutProps) {
  return (
    <AuthWrapper>
      <SidebarProvider>
        <InvokeAppHistory>
          <NavBarItems activePage={activePage} />
          <SidebarInset>
            <header className="sticky top-0 flex h-14 shrink-0 items-center gap-2 bg-background">
              <div className="flex flex-1 items-center gap-2 px-3">
                <SidebarTrigger />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumb>
                  <BreadcrumbList>
                    {breadcrumbItems.map((item, index) => (
                      <>
                        <BreadcrumbItem key={index}>
                          <BreadcrumbPage className="line-clamp-1">
                            <Link href={item.href}>{item.label}</Link>
                          </BreadcrumbPage>
                        </BreadcrumbItem>
                        {index < breadcrumbItems.length - 1 && (
                          <BreadcrumbSeparator />
                        )}
                      </>
                    ))}
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
              <div className="flex items-center pr-4">
                <NavUser />
              </div>
            </header>
            <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
          </SidebarInset>
        </InvokeAppHistory>
      </SidebarProvider>
    </AuthWrapper>
  );
}
