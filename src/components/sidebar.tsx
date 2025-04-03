"use client";

import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { appName } from "@/constants/version";
import { navItems } from "@/components/IconSidebar";
import { cn } from "@/lib/utils";

export const StaticSidebar = () => {
  const router = useRouter();
  const pathName = usePathname();
  const handleNewChat = () => {
    const newSessionId = crypto.randomUUID();
    router.push(`/?session=${newSessionId}`);
  };

  return (
    <div className="flex flex-col absolute inset-0">
      <div className="flex-none p-6 border-b border-primary/5">
        <div className="flex items-center justify-between">
          <Link href="/" className="font-title text-2xl font-bold dark:text-white hover:opacity-80 transition-opacity">
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
      </div>

      <div className="flex-1 overflow-hidden flex flex-col px-4">
        <div className="flex-1 overflow-y-auto flex flex-col gap-1">
          {navItems.map((item) => (
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
              {/* <Link
                  href={item.href}
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-md text-muted-foreground",
                    "hover:bg-primary/10 hover:text-primary transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  )}
                > */}
              <item.icon className="h-6 w-6" />
              <span>{item.name}</span>
              {/* </Link> */}
            </Link>
          ))}
        </div>
      </div>

      <div className="flex-none p-4 border-t border-primary/5">{/* user */}</div>
    </div>
  );
};
