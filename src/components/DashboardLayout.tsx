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

interface ChatLayoutProps {
  children: React.ReactNode;
  breadcrumbItems?: BreadcrumbItem[];
}

export function ChatLayout({ children }: ChatLayoutProps) {
  const { deleteSession, updateSessionTitle, currentSession } = useChatStore();
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
                {currentSession?.id && (
                  <>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage className="line-clamp-1">
                        <ChatItemDropdown
                          session={currentSession}
                          onRename={updateSessionTitle}
                          onDelete={deleteSession}
                        />
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

function ChatItemDropdown({
  session,
  onRename,
  onDelete,
}: {
  session: ChatSession;
  onRename: (sessionId: string, title: string) => void;
  onDelete: (sessionId: string) => void;
}) {
  const router = useRouter();

  if (!session) {
    return null;
  }

  const handleRenameChat = async () => {
    const newName = window.prompt("Enter new name for chat:", session.name);
    if (newName && newName !== session.name) {
      await onRename(session.id, newName);
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
      router.push("/");
      await onDelete(session.id);
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
