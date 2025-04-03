"use client";

import { Button } from "@/components/ui/button";
import { useChatStore } from "@/store/chat-store";
import { Menu, X } from "lucide-react";
import { ChatAppSidebarV2 } from "@/components/chat-app/sidebar";
import { useEffect } from "react";

export function ChatAppMobileSidebarV2({ sessionId }: { sessionId: string }) {
  const { chatSessions, isMobileSidebarOpen, setMobileSidebarOpen, selectedChats, clearChatSelection } = useChatStore();

  // Close mobile sidebar when route changes
  useEffect(() => {
    const handleRouteChange = () => {
      setMobileSidebarOpen(false);
    };

    window.addEventListener("popstate", handleRouteChange);
    return () => {
      window.removeEventListener("popstate", handleRouteChange);
    };
  }, [setMobileSidebarOpen]);

  // Close selection mode when closing sidebar
  const handleCloseSidebar = () => {
    setMobileSidebarOpen(false);
    if (selectedChats.length > 0) {
      clearChatSelection();
    }
  };

  return (
    <>
      {/* Mobile Sidebar Toggle Button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed left-4 top-4 z-50 md:hidden"
        onClick={() => setMobileSidebarOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Sidebar Overlay for Mobile */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 dark:bg-background/90 backdrop-blur-sm z-40 md:hidden"
          onClick={handleCloseSidebar}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 w-72 bg-background border-r border-border transform transition-transform duration-200 ease-in-out md:hidden
          ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="absolute right-4 top-4">
          <Button variant="ghost" size="icon" onClick={handleCloseSidebar}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <ChatAppSidebarV2 existingData={chatSessions} sessionId={sessionId} />
      </div>
    </>
  );
}
