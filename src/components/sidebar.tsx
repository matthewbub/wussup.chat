"use client";

import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { appConfig } from "@/constants/app-config";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/app/theme-toggle";
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import { dark } from "@clerk/themes";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/Tooltip";
import { useChatStore } from "@/store/chat-store";

export const StaticSidebar = () => {
  const router = useRouter();
  const pathName = usePathname();
  const { theme } = useTheme();
  const { user } = useUser();
  const { setSessionId, setMessages } = useChatStore();

  const handleNewChat = () => {
    const newSessionId = crypto.randomUUID();
    setSessionId(newSessionId);
    setMessages(null);
    router.push(`/?session=${newSessionId}`);
  };

  return (
    <div className="flex flex-col absolute inset-0">
      <div className="flex-none p-6 border-b border-primary/5">
        <div className="flex items-center justify-between">
          <Link href="/" className="font-title text-2xl font-bold dark:text-white hover:opacity-80 transition-opacity">
            {appConfig.name}
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
      </div>

      <div className="flex-1 overflow-hidden flex flex-col px-4">
        <div className="flex-1 overflow-y-auto flex flex-col gap-1">
          {[...appConfig.navigation.topNav, ...appConfig.navigation.bottomNav].map((item) => (
            <Link
              className={cn(
                "flex items-center space-x-2 py-2 px-3 rounded-md text-sm text-foreground/80 hover:bg-primary/5 hover:text-primary transition-colors truncate",
                {
                  "bg-primary/10 text-primary font-medium": item.href === pathName,
                }
              )}
              href={item.href}
              key={item.href}
            >
              <item.icon className="h-6 w-6" />
              <span>{item.name}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="flex-none p-4 border-t border-primary/5 flex flex-col gap-3">
        <ThemeToggle withLabel />
        <SignedOut>
          <SignInButton>
            <Button variant="ghost" className="w-full">
              Sign In
            </Button>
          </SignInButton>
          <SignUpButton>
            <Button variant="default" className="w-full">
              Sign Up
            </Button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <div className="flex items-center rounded-md p-2 bg-muted/30">
            <UserButton
              appearance={{
                baseTheme: theme === "dark" ? dark : undefined,
                elements: {
                  avatarBox: "h-8 w-8",
                },
              }}
              userProfileProps={{
                appearance: {
                  baseTheme: theme === "dark" ? dark : undefined,
                },
              }}
            />
            <div className="flex-1 min-w-0 ml-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className="text-sm text-foreground/80 truncate">{user?.emailAddresses[0]?.emailAddress}</p>
                  </TooltipTrigger>
                  <TooltipContent side="top">{user?.emailAddresses[0]?.emailAddress}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </SignedIn>
      </div>
    </div>
  );
};
