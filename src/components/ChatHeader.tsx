"use client";

import type React from "react";

import Link from "next/link";
import { SignInButton, SignUpButton, SignedOut, UserButton, SignedIn } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { useChatStore } from "@/store/chat-store";
import { ThemeToggle } from "@/app/theme-toggle";
import { useState, useRef, useEffect } from "react";
import { Pencil } from "lucide-react";

export function ChatHeader() {
  const { chatTitle, sessionId, updateSessionTitle } = useChatStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editableTitle, setEditableTitle] = useState(chatTitle);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus the input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditableTitle(e.target.value);
  };

  const handleTitleBlur = async () => {
    setIsEditing(false);

    // Don't make API call if title hasn't changed
    if (editableTitle === chatTitle || !editableTitle.trim()) {
      setEditableTitle(chatTitle);
      return;
    }

    try {
      const response = await fetch("/api/v3/manual-title-update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: editableTitle,
          session_id: sessionId,
        }),
      });

      if (response.ok) {
        // Update both the chat title and session title in the store
        updateSessionTitle(sessionId, editableTitle);
      } else {
        // Revert to original title if update failed
        setEditableTitle(chatTitle);
        console.error("Failed to update title");
      }
    } catch (error) {
      console.error("Error updating title:", error);
      setEditableTitle(chatTitle);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      inputRef.current?.blur();
    } else if (e.key === "Escape") {
      setEditableTitle(chatTitle);
      setIsEditing(false);
    }
  };

  return (
    <header className="w-full py-4">
      <div className="container mx-auto px-4 flex justify-between items-center border-b border-primary/10 pb-4 bg-background">
        <nav className="flex items-center gap-2">
          <Link href="/" className="">
            Chat
          </Link>
          <span>/</span>
          <SignedIn>
            {isEditing ? (
              <input
                ref={inputRef}
                type="text"
                value={editableTitle}
                onChange={handleTitleChange}
                onBlur={handleTitleBlur}
                onKeyDown={handleKeyDown}
                className="bg-transparent border-b border-dashed border-gray-400 focus:outline-none focus:border-primary px-1 min-w-[120px]"
                aria-label="Edit chat title"
              />
            ) : (
              <div className="flex items-center gap-1 cursor-pointer group" onClick={handleEditClick}>
                <span>{chatTitle}</span>
                <Pencil className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )}
          </SignedIn>
          <SignedOut>
            <span>{chatTitle}</span>
          </SignedOut>
        </nav>

        <div className="flex flex-1 justify-end gap-4">
          <ThemeToggle />
          <SignedOut>
            <SignInButton>
              <Button variant="ghost">Sign In</Button>
            </SignInButton>
            <SignUpButton>
              <Button variant="default">Sign Up</Button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
