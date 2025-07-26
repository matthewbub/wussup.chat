"use client";
import { appConfig } from "@/constants/app-config";
import { SignInButton } from "@clerk/nextjs";
import { SignedOut } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";
import { SignedIn } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserIcon } from "lucide-react";

export default function Header() {
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
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="ghost" size="icon" className="w-10 h-10">
                <UserIcon className="h-5 w-5" />
              </Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <Link href="/chat">
              <Button variant="ghost">Chat</Button>
            </Link>
            <UserButton
              appearance={{
                baseTheme: dark,
                elements: {
                  avatarBox: "h-8 w-8",
                },
              }}
              userProfileProps={{
                appearance: {
                  baseTheme: dark,
                },
              }}
            />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
