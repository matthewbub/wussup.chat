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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pencil,
  LinkIcon,
  ArrowUpRight,
  Trash2,
  WandSparkles,
} from "lucide-react";
import { useChatStore } from "@/stores/chatStore";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Input } from "@/components/ui/input";

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface ChatLayoutProps {
  children: React.ReactNode;
  breadcrumbItems?: BreadcrumbItem[];
}

export function ChatLayout({ children }: ChatLayoutProps) {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session");
  const { sessions } = useChatStore();

  // Find current session from sessions using sessionId
  const currentSession = sessionId
    ? Object.values(sessions)
        .flat()
        .find((s) => s.id === sessionId)
    : null;

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
                {currentSession && (
                  <>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage className="line-clamp-1">
                        <ChatItemDropdown />
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
    </SidebarProvider>
  );
}

function ChatItemDropdown() {
  const { deleteSession, updateSessionTitle, sessions } = useChatStore();
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [newChatName, setNewChatName] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const sessionId = useSearchParams().get("session");
  const currentSession = sessionId
    ? Object.values(sessions)
        .flat()
        .find((s) => s.id === sessionId)
    : null;

  if (!currentSession) {
    return null;
  }

  const handleRenameChat = async () => {
    if (newChatName && newChatName !== currentSession.name) {
      await updateSessionTitle(currentSession.id, newChatName);
      setIsRenameDialogOpen(false);
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/?session=${currentSession.id}`;
    navigator.clipboard.writeText(url);
  };

  const handleOpenInNewTab = () => {
    window.open(`/?session=${currentSession.id}`, "_blank");
  };

  const handleDeleteChat = async () => {
    setIsDeleteDialogOpen(false);
    await deleteSession(currentSession.id);

    router.push(`/~`);
    router.refresh();
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          asChild
          className="w-full hover:bg-accent rounded-md px-2 py-1 group"
        >
          <div className="cursor-pointer flex items-center gap-2">
            <span>{currentSession?.name}</span>
            <Pencil className="hidden group-hover:block text-muted-foreground w-4 h-4" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 rounded-lg" side={"bottom"}>
          <DropdownMenuItem
            onClick={() => {
              setNewChatName(currentSession.name);
              setIsRenameDialogOpen(true);
            }}
          >
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
          <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)}>
            <Trash2 className="text-muted-foreground" />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Chat</DialogTitle>
            <DialogDescription>
              Enter a new name for this chat.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={newChatName}
            onChange={(e) => setNewChatName(e.target.value)}
            placeholder="Enter chat name"
          />
          <div className="flex justify-between">
            <Button
              variant="ghost"
              disabled={aiLoading}
              onClick={async () => {
                setAiLoading(true);
                const data = {
                  session_id: currentSession.id,
                  messages: currentSession.messages,
                };

                const response = await fetch("/api/v1/title", {
                  method: "POST",
                  body: JSON.stringify(data),
                });

                const titleData = await response.json();

                setNewChatName(titleData.title);
                setAiLoading(false);
              }}
            >
              <WandSparkles className="w-4 h-4" />
            </Button>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={() => setIsRenameDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleRenameChat}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Chat</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this chat? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteChat}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
