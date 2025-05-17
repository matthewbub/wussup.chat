"use client";
import { Image as ImageIcon, Plus, User } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { useChatStore } from "@/app/chat/Lifecycle";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";

export function AppSidebar() {
  const store = useChatStore();
  const router = useRouter();

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup className="pt-0">
          <SidebarGroupLabel className="text-muted-foreground font-black sticky top-0 h-[60px] bg-background z-10 flex justify-between">
            <Link href="/" className="text-muted-foreground font-black">
              Wussup
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/chat/" + crypto.randomUUID())}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {store.chatHistories.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton asChild>
                    <Link
                      href={"/chat/" + item.id}
                      className={cn({
                        "bg-sidebar":
                          store?.selectedChatHistory?.id === item.id,
                      })}
                    >
                      <span className="text-muted-foreground">
                        {item.chatName}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <Separator className="mt-4" />
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/images">
                    <ImageIcon className="w-4 h-4" />
                    <span className="text-muted-foreground">Images</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/account">
                    <User className="w-4 h-4" />
                    <span className="text-muted-foreground">Account</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild className="w-full">
                  <ThemeToggle withLabel />
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
}
