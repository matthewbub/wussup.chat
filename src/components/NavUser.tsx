"use client";

import { CreditCard, LogOut } from "lucide-react";
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
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { createClient } from "@/lib/supabase-client";
import { useRouter } from "next/navigation";
import { BillingModal } from "@/components/BillingModal";
import crypto from "crypto";
import { useChatStore } from "@/stores/chatStore";

const getGravatarUrl = (email: string) => {
  const hash = crypto
    .createHash("md5")
    .update(email.toLowerCase().trim())
    .digest("hex");
  return `https://www.gravatar.com/avatar/${hash}?d=mp`;
};

export function NavUser() {
  const supabase = createClient();
  const { user, openModal, closeModal, activeModal } = useChatStore();
  const router = useRouter();

  const avatarFallback = user ? user.email?.slice(0, 2).toUpperCase() : "GU";

  const handleManageSubscription = () => {
    openModal("billing");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    await router.refresh();
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
                <Avatar className="h-8 w-8 rounded-lg">
                  {user?.email && (
                    <AvatarImage src={gravatarUrl} alt={user.email} />
                  )}
                  <AvatarFallback className="rounded-lg">
                    {avatarFallback}
                  </AvatarFallback>
                </Avatar>
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              side={"bottom"}
              align="start"
              sideOffset={4}
            >
              {user ? (
                <>
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                      <Avatar className="h-8 w-8 rounded-lg">
                        {user.email && (
                          <AvatarImage src={gravatarUrl} alt={user.email} />
                        )}
                        <AvatarFallback className="rounded-lg">
                          {avatarFallback}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">
                          {user.email || "Guest User"}
                        </span>
                        <span className="truncate text-xs">{user.email}</span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleManageSubscription}>
                    <CreditCard />
                    {user?.subscriptionStatus === "active"
                      ? "Manage Subscription"
                      : "Upgrade to Pro"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut />
                    Log out
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => openModal("auth")}>
                    <LogOut className="rotate-180" />
                    Sign In
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
      <AuthModal isOpen={activeModal === "auth"} onClose={() => closeModal()} />
      <BillingModal
        isOpen={activeModal === "billing"}
        onClose={() => closeModal()}
        userId={user?.user_id}
      />
    </>
  );
}
