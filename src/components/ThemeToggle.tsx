"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ThemeToggle({ withLabel }: { withLabel?: boolean }) {
  const { setTheme, theme } = useTheme();

  if (theme === undefined) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size={withLabel ? "default" : "icon"}
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className={cn(
        "flex items-center w-full text-muted-foreground",
        // "hover:bg-primary/10 hover:text-primary transition-colors",
        // "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        withLabel ? "justify-start" : "justify-center"
      )}
    >
      <Sun className="h-4 w-4 dark:hidden" />
      <Moon className="hidden h-4 w-4 dark:block" />
      <span className="sr-only">Toggle theme</span>

      <span className={cn({ hidden: !withLabel })}>
        {theme.charAt(0).toUpperCase() + theme.slice(1)}
      </span>
    </Button>
  );
}
