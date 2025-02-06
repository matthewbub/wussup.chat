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
import { AppSidebar } from "@/components/system/AppSidebar";
import Link from "next/link";
import { NavUser } from "@/components/system/NavUser";
import { Fragment } from "react";

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
    <SidebarProvider>
      <AppSidebar activePage={activePage} />
      <SidebarInset>
        <header className="sticky top-0 flex h-14 shrink-0 items-center gap-2 bg-background">
          <div className="flex flex-1 items-center gap-2 px-3">
            <SidebarTrigger />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbItems.map((item, index) => (
                  <Fragment key={index}>
                    <BreadcrumbItem>
                      <BreadcrumbPage className="line-clamp-1">
                        <Link href={item.href}>{item.label}</Link>
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                    {index < breadcrumbItems.length - 1 && (
                      <BreadcrumbSeparator />
                    )}
                  </Fragment>
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
    </SidebarProvider>
  );
}
