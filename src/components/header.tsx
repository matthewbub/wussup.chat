"use client";
import { ThemeToggle } from "@/app/theme-toggle";
import { appConfig } from "@/constants/app-config";
import { SignInButton } from "@clerk/nextjs";
import { SignedOut } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";
import { SignedIn } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { UserIcon } from "lucide-react";

export default function Header() {
  const { theme } = useTheme();
  return (
    <header className="w-full py-4">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link
          href="/"
          className="text-xl font-bold text-primary hover:opacity-80 transition-opacity"
        >
          {appConfig.name}
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="ghost" size="icon" className="w-10 h-10">
                <UserIcon className="h-5 w-5" />
              </Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
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
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
