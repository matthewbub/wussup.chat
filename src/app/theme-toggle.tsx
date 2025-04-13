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
        "flex items-center rounded-md text-muted-foreground",
        "hover:bg-primary/10 hover:text-primary transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        withLabel ? "justify-start" : "justify-center"
      )}
    >
      <Sun className="h-6 w-6 dark:hidden" />
      <Moon className="hidden h-6 w-6 dark:block" />
      <span className="sr-only">Toggle theme</span>

      <span className={cn({ hidden: !withLabel })}>{"Current theme: " + theme}</span>
    </Button>
  );
}
