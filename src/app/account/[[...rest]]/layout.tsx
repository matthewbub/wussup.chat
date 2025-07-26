import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider className="h-full relative" defaultOpen>
      <AppSidebar />
      <SidebarTrigger className="mt-4 ml-4 sticky top-0 text-muted-foreground" />
      <div className="h-full w-full">{children}</div>
    </SidebarProvider>
  );
}
