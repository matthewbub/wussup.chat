"use client";

import type React from "react";

import { cn } from "@/lib/utils";
import { Home, Newspaper, Rss, FileText, Settings, HelpCircle } from "lucide-react";
import Link from "next/link";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type NavItem = {
  name: string;
  href: string;
  icon: React.ElementType;
};

const navItems: NavItem[] = [
  { name: "Home", href: "/", icon: Home },
  { name: "News", href: "/news", icon: Newspaper },
  { name: "My RSS", href: "/rss", icon: Rss },
  { name: "Documentation", href: "/docs", icon: FileText },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Support", href: "/support", icon: HelpCircle },
];

export function IconSidebar() {
  return (
    <div className="hidden md:flex flex-col items-center w-16 h-full bg-background border-r border-border py-4">
      <TooltipProvider delayDuration={300}>
        <nav className="flex flex-col items-center space-y-4 w-full">
          {navItems.map((item) => (
            <Tooltip key={item.name}>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-md text-muted-foreground",
                    "hover:bg-primary/10 hover:text-primary transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  )}
                >
                  <item.icon className="h-6 w-6" />
                  <span className="sr-only">{item.name}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{item.name}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </nav>
      </TooltipProvider>
    </div>
  );
}

export function MobileNavItems() {
  return (
    <div className="grid grid-cols-3 gap-2 px-4 py-3 border-b border-primary/5 md:hidden">
      {navItems.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          className="flex flex-col items-center justify-center p-2 rounded-md text-muted-foreground hover:bg-primary/5 hover:text-primary transition-colors"
        >
          <item.icon className="h-5 w-5 mb-1" />
          <span className="text-xs">{item.name}</span>
        </Link>
      ))}
    </div>
  );
}
