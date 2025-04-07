"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { type ChatSession, useChatStore } from "@/store/chat-store";
import { Check, Copy, Edit, MoreHorizontal, Pin, PlusIcon, Trash, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { appName } from "@/constants/version";
import { useState, useEffect, useRef } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/Tooltip";

export const ChatAppSidebarV2 = ({ existingData, sessionId }: { existingData: ChatSession[]; sessionId: string }) => {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollzoneRef = useRef<HTMLDivElement>(null);
  const {
    setMessages,
    setSessionId,
    deleteSession,
    deleteMultipleSessions,
    togglePinSession,
    duplicateSession,
    toggleChatSelection,
    selectAllChats,
    clearChatSelection,
    selectedChats,
    setMobileSidebarOpen,
    chatSessions,
    updateSessionTitleWithDb,
    setIsLoadingChatHistory,
  } = useChatStore();

  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isRenaming, setIsRenaming] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | string[] | null>(null);

  const sortedSessions = [...chatSessions].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const pinnedSessions = sortedSessions.filter((session) => session.pinned);
  const otherSessions = sortedSessions.filter((session) => !session.pinned);

  const handleNewChat = () => {
    const newSessionId = crypto.randomUUID();
    setSessionId(newSessionId);
    setMessages(null);
    setMobileSidebarOpen(false);
    router.push(`/?session=${newSessionId}`);
  };

  const handleRename = (id: string, currentName: string) => {
    setIsRenaming(id);
    setNewTitle(currentName);
  };

  const submitRename = async (id: string) => {
    if (newTitle.trim()) {
      const result = await updateSessionTitleWithDb(id, newTitle.trim());
      if (result.error) {
        // You could add a toast notification here to show the error
        console.error("Failed to update title:", result.error);
      }
    }
    setIsRenaming(null);
  };

  const handleDelete = (id: string | string[]) => {
    setConfirmDelete(id);
  };

  const confirmDeleteAction = () => {
    if (Array.isArray(confirmDelete)) {
      deleteMultipleSessions(confirmDelete);
      if (confirmDelete.includes(sessionId)) {
        handleNewChat();
      }
    } else if (confirmDelete) {
      deleteSession(confirmDelete);
      if (confirmDelete === sessionId) {
        handleNewChat();
      }
    }
    setConfirmDelete(null);
    setIsSelectionMode(false);
    clearChatSelection();
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    if (isSelectionMode) {
      clearChatSelection();
    }
  };

  const renderChatItem = (session: ChatSession) => {
    if (isRenaming === session.id) {
      return (
        <div className="flex items-center gap-2 py-1 px-2">
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="h-8 text-sm"
            autoFocus
            onKeyDown={async (e) => {
              if (e.key === "Enter") await submitRename(session.id);
              if (e.key === "Escape") setIsRenaming(null);
            }}
          />
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={async () => await submitRename(session.id)}>
            <Check className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setIsRenaming(null)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      );
    }

    return (
      <div className="group flex items-center gap-2 w-full">
        {isSelectionMode && (
          <Checkbox
            checked={selectedChats.includes(session.id)}
            onCheckedChange={() => toggleChatSelection(session.id)}
            className="ml-1 border-primary/30 dark:border-primary/50"
          />
        )}

        <Button
          unstyled
          className={cn(
            "flex-1 py-2 px-3 rounded-md text-sm text-foreground/80 hover:bg-primary/5 hover:text-primary transition-colors truncate",
            {
              "bg-primary/10 text-primary font-medium": session.id === sessionId,
            }
          )}
          onClick={() => {
            setIsLoadingChatHistory(true);
            setMobileSidebarOpen(false);
            setMessages(null);
            router.push(`/?session=${session.id}`);
          }}
        >
          <div className="flex items-center gap-2">
            {session.pinned && <Pin className="h-3 w-3 text-muted-foreground" />}
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="truncate">{session.name || session.id}</span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{session.name || session.id}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </Button>

        {!isSelectionMode && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 focus:opacity-100"
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleRename(session.id, session.name)}>
                <Edit className="h-4 w-4 mr-2" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => duplicateSession(session.id)}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => togglePinSession(session.id)}>
                <Pin className="h-4 w-4 mr-2" />
                {session.pinned ? "Unpin" : "Pin"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => handleDelete(session.id)}
              >
                <Trash className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    );
  };

  const renderSessionGroup = (title: string, sessions: ChatSession[]) => {
    if (sessions.length === 0) return null;

    return (
      <div className="mb-4">
        <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-2 px-3 font-medium dark:text-muted-foreground/90">
          {title}
        </h3>
        <div className="space-y-1">
          {sessions.map((session) => (
            <div key={session.id}>{renderChatItem(session)}</div>
          ))}
        </div>
      </div>
    );
  };

  useEffect(() => {
    const calculateScrollHeight = () => {
      if (containerRef.current && scrollzoneRef.current) {
        const containerHeight = containerRef.current.clientHeight;
        const scrollzoneTop = scrollzoneRef.current.offsetTop;
        const footerHeight = 56; // Height of the footer (p-4 + content)

        const availableHeight = containerHeight - scrollzoneTop - footerHeight;
        scrollzoneRef.current.style.height = `${availableHeight}px`;
      }
    };

    calculateScrollHeight();
    window.addEventListener("resize", calculateScrollHeight);

    return () => window.removeEventListener("resize", calculateScrollHeight);
  }, [isSelectionMode]); // Recalculate when selection mode changes as it affects layout

  return (
    <TooltipProvider>
      <div className="flex flex-col absolute inset-0">
        <div className="flex-none p-6 border-b border-primary/5">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="font-title text-2xl font-bold dark:text-white hover:opacity-80 transition-opacity"
            >
              {appName}
            </Link>
          </div>
        </div>

        <div className="flex-none p-4 space-y-2">
          <Button
            variant="outline"
            className="w-full group transition-all hover:bg-primary hover:text-primary-foreground"
            onClick={handleNewChat}
          >
            <PlusIcon className="h-4 w-4 mr-2 group-hover:text-primary-foreground" />
            New Chat
          </Button>

          <div className="flex justify-end px-1">
            {isSelectionMode ? (
              <Button
                variant="link"
                size="sm"
                onClick={toggleSelectionMode}
                className="text-xs h-6 p-0 text-primary font-medium"
              >
                Exit selection
              </Button>
            ) : (
              <Button
                variant="link"
                size="sm"
                onClick={toggleSelectionMode}
                className="text-xs h-6 p-0 text-muted-foreground hover:text-foreground"
              >
                Bulk select
              </Button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col px-4">
          {isSelectionMode && (
            <div className="flex-none bg-background pt-2 pb-2 border-b border-primary/5 mb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">
                  {selectedChats.length > 0 ? `${selectedChats.length} selected` : "Select conversations"}
                </span>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={selectAllChats} className="text-xs h-7">
                    Select All
                  </Button>
                  {selectedChats.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearChatSelection} className="text-xs h-7">
                      Clear
                    </Button>
                  )}
                </div>
              </div>

              {selectedChats.length > 0 && (
                <Button variant="destructive" size="sm" onClick={() => handleDelete(selectedChats)} className="w-full">
                  <Trash className="h-4 w-4 mr-2" />
                  Delete {selectedChats.length} conversation{selectedChats.length !== 1 ? "s" : ""}
                </Button>
              )}
            </div>
          )}

          <div className="flex-1 overflow-y-auto">
            {renderSessionGroup("Pinned", pinnedSessions)}
            {renderSessionGroup("Recent Conversations", otherSessions)}
          </div>
        </div>

        <div className="flex-none p-4 border-t border-primary/5">
          <div className="text-xs text-muted-foreground">
            {existingData.length} conversation{existingData.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={confirmDelete !== null} onOpenChange={(open) => !open && setConfirmDelete(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
            </DialogHeader>
            <p>
              {Array.isArray(confirmDelete)
                ? `Are you sure you want to delete ${confirmDelete.length} conversation${
                    confirmDelete.length !== 1 ? "s" : ""
                  }?`
                : "Are you sure you want to delete this conversation?"}
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmDelete(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDeleteAction}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};
