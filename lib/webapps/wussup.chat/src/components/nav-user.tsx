"use client";

import {
  BadgeCheck,
  CreditCard,
  LogOut,
  Settings,
  Sparkles,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  useSidebar,
} from "@/components/ui/sidebar";

import { useSubscriptionStore } from "@/stores/useSubscription";
import Link from "next/link";
import { createClient } from "@/lib/supabase-client";
import { useState } from "react";
import { useEffect } from "react";
import { User } from "@supabase/supabase-js";

export function NavUser() {
  const supabase = createClient();
  const { isMobile } = useSidebar();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const { subscription } = useSubscriptionStore();
  // const avatarFallback = user?.username?.slice(0, 2).toUpperCase();
  const avatarFallback = user ? user.email?.slice(0, 2).toUpperCase() : "GU";
  const handleManageSubscription = async () => {
    try {
      // Create Stripe customer portal session
      const response = await fetch(
        `/api/subscription/manage?userId=${user?.id}`
      );
      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error("[BillingSettings] Failed to open customer portal:", error);
    }
  };

  const handleLoginModal = () => {
    // openModal("login");
  };

  const handleLogout = async () => {
    console.log("[NavUser] Logging out");
    await supabase.auth.signOut();
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                {/* <AvatarImage src={user.avatar} alt={user.name} /> */}
                <AvatarFallback className="rounded-lg">
                  {avatarFallback}
                </AvatarFallback>
              </Avatar>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="start"
            sideOffset={4}
          >
            {user ? (
              <>
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      {/* <AvatarImage src={user.avatar} alt={user.name} /> */}
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
                <DropdownMenuGroup>
                  <Link href="/settings?tab=billing">
                    <DropdownMenuItem>
                      <Sparkles />
                      {subscription?.isSubscribed ? "Pro" : "Upgrade to Pro"}
                    </DropdownMenuItem>
                  </Link>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <Link href="/settings?tab=account">
                    <DropdownMenuItem>
                      <BadgeCheck />
                      Account
                    </DropdownMenuItem>
                  </Link>

                  <DropdownMenuItem onClick={handleManageSubscription}>
                    <CreditCard />
                    Billing
                  </DropdownMenuItem>

                  <Link href="/settings?tab=settings">
                    <DropdownMenuItem>
                      <Settings />
                      Settings
                    </DropdownMenuItem>
                  </Link>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut />
                  Log out
                </DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={handleLoginModal}>
                  <LogOut className="rotate-180" />
                  Sign In
                </DropdownMenuItem>
              </DropdownMenuGroup>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
