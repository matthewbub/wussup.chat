"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ThemeToggle({ withLabel }: { withLabel: boolean }) {
  const { setTheme, theme } = useTheme();

  return (
    <Button
      variant="ghost"
      size={withLabel ? "default" : "icon"}
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      <Sun className="h-[1.5rem] w-[1.3rem] dark:hidden" />
      <Moon className="hidden h-5 w-5 dark:block" />
      <span className="sr-only">Toggle theme</span>

      <span className={cn({ hidden: !withLabel })}>{"Current theme: " + theme}</span>
    </Button>
  );
}
