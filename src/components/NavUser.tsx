"use client";

import { CreditCard, LogOut, StickyNote, User as UserIcon } from "lucide-react";
import { AuthModal } from "@/components/AuthModal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { BillingModal } from "@/components/BillingModal";
import crypto from "crypto";
import { useRouter } from "next/navigation";
import { ContextDialog } from "@/components/ContextModal";
import { useState } from "react";
import { useChatStore } from "@/app/chat/_store/chat";

const getGravatarUrl = (email: string) => {
  const hash = crypto.createHash("md5").update(email.toLowerCase().trim()).digest("hex");
  return `https://www.gravatar.com/avatar/${hash}?d=mp`;
};

export function NavUser() {
  const router = useRouter();
  const { user } = useChatStore();
  const avatarFallback = user ? user.email?.slice(0, 2).toUpperCase() : "GU";
  const [showContextDialog, setShowContextDialog] = useState(false);
  const [activeModal, setActiveModal] = useState<"auth" | "billing" | null>(null);

  const handleManageSubscription = () => {
    setActiveModal("billing");
  };

  const handleLogout = async () => {
    try {
      // Call server-side logout endpoint
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      // Clear the chat store state
      // clearStore();

      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const gravatarUrl = user?.email ? getGravatarUrl(user.email) : "";

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                {user?.email ? (
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={gravatarUrl} alt={user.email} />
                    <AvatarFallback className="rounded-lg">{avatarFallback}</AvatarFallback>
                  </Avatar>
                ) : (
                  <UserIcon className="h-8 w-8 rounded-lg" />
                )}
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              side={"bottom"}
              align="start"
              sideOffset={4}
            >
              {user?.clerk_user_id ? (
                <>
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                      {user.email && (
                        <Avatar className="h-8 w-8 rounded-lg">
                          <AvatarImage src={gravatarUrl} alt={user.email} />
                          <AvatarFallback className="rounded-lg">{avatarFallback}</AvatarFallback>
                        </Avatar>
                      )}
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">{user.email || "Guest User"}</span>
                        <span className="truncate text-xs">{user.email}</span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setShowContextDialog(true)}>
                    <StickyNote />
                    Set Context
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleManageSubscription}>
                    <CreditCard />
                    {user?.subscriptionStatus === "active" ? "Manage Subscription" : "Upgrade to Pro"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut />
                    Log out
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => setActiveModal("auth")}>
                    <LogOut className="rotate-180" />
                    Sign In
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
      <AuthModal isOpen={activeModal === "auth"} onClose={() => setActiveModal(null)} />
      <BillingModal isOpen={activeModal === "billing"} onClose={() => setActiveModal(null)} />
      <ContextDialog open={showContextDialog} onOpenChange={setShowContextDialog} />
    </>
  );
}
