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
import { AppSidebar } from "@/components/AppSidebar";
import Link from "next/link";
import { NavUser } from "@/components/NavUser";
import { Fragment } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Pencil, LinkIcon, ArrowUpRight, Trash2 } from "lucide-react";
import { useChatStore } from "@/stores/chatStore";
import { useRouter } from "next/navigation";
import { ChatSession } from "@/types/chat";

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  breadcrumbItems?: BreadcrumbItem[];
}

export function DashboardLayout({
  children,
  breadcrumbItems = [],
}: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
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

export function ChatLayout({
  children,
  session,
}: DashboardLayoutProps & { session: ChatSession }) {
  return (
    <SidebarProvider>
      <AppSidebar />
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
                {session && (
                  <>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage className="line-clamp-1">
                        <ChatItemDropdown session={session} />
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
        <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}

function ChatItemDropdown({ session }: { session: ChatSession }) {
  const { deleteSession, updateSessionTitle } = useChatStore();
  const router = useRouter();

  const handleRenameChat = async () => {
    const newName = window.prompt("Enter new name for chat:", session.name);
    if (newName && newName !== session.name) {
      await updateSessionTitle(session.id, newName);
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/?session=${session.id}`;
    navigator.clipboard.writeText(url);
  };

  const handleOpenInNewTab = () => {
    window.open(`/?session=${session.id}`, "_blank");
  };

  const handleDeleteChat = async () => {
    if (window.confirm("Are you sure you want to delete this chat?")) {
      await deleteSession(session.id);
      router.push("/");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        asChild
        className="w-full hover:bg-accent rounded-md px-2 py-1 group"
      >
        <div className="cursor-pointer flex items-center gap-2">
          <span>{session?.name}</span>
          <Pencil className="hidden group-hover:block text-muted-foreground w-4 h-4" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 rounded-lg" side={"bottom"}>
        <DropdownMenuItem onClick={handleRenameChat}>
          <Pencil className="text-muted-foreground" />
          <span>Rename Chat</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleCopyLink}>
          <LinkIcon className="text-muted-foreground" />
          <span>Copy Link</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleOpenInNewTab}>
          <ArrowUpRight className="text-muted-foreground" />
          <span>Open in New Tab</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDeleteChat}>
          <Trash2 className="text-muted-foreground" />
          <span>Delete</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
