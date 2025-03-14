"use client";
import { useChatStore } from "../_store/chat";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Pencil, LinkIcon, ArrowUpRight, Trash2, WandSparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ChatTitleWidget() {
  const { updateSessionName, currentSession } = useChatStore();
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [newChatName, setNewChatName] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const handleRenameChat = async () => {
    if (newChatName && newChatName !== currentSession?.name) {
      await updateSessionName(newChatName);
      setIsRenameDialogOpen(false);
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/${currentSession?.id}`;
    navigator.clipboard.writeText(url);
  };

  const handleOpenInNewTab = () => {
    window.open(`/chat?session=${currentSession?.id}`, "_blank");
  };

  const handleDeleteChat = async () => {
    try {
      const response = await fetch(`/api/v1/delete-chat?sessionId=${currentSession?.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        console.error("Failed to delete chat session");
        return;
      }

      setIsDeleteDialogOpen(false);
      router.push(`/~`);
      router.refresh();
    } catch (error) {
      console.error("Error deleting chat session:", error);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild className="w-full hover:bg-accent rounded-md px-2 py-1 group">
          <div className="cursor-pointer flex items-center gap-2">
            <span>{currentSession?.name}</span>
            <Pencil className="hidden group-hover:block text-muted-foreground w-4 h-4" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 rounded-lg" side={"bottom"}>
          <DropdownMenuItem
            onClick={() => {
              setNewChatName(currentSession?.name || "");
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
            <DialogDescription>Enter a new name for this chat.</DialogDescription>
          </DialogHeader>
          <Input value={newChatName} onChange={(e) => setNewChatName(e.target.value)} placeholder="Enter chat name" />
          <div className="flex justify-between">
            <Button
              variant="ghost"
              disabled={aiLoading}
              onClick={async () => {
                setAiLoading(true);
                const data = {
                  session_id: currentSession?.id || "",
                  messages: currentSession?.messages || [],
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
              <Button variant="ghost" onClick={() => setIsRenameDialogOpen(false)}>
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
              Are you sure you want to delete this chat? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDeleteDialogOpen(false)}>
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
