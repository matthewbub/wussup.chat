import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export const Header = () => {
  return (
    <header className="container mx-auto px-4 py-6 flex justify-between items-center">
      <div className="text-2xl font-bold text-gray-900 dark:text-white">
        Wussup Chat
      </div>
      <div className="flex gap-4 items-center">
        <SignedOut>
          <Link href="/sign-in">
            <Button variant="outline">Sign In</Button>
          </Link>
          <Link href="/sign-up">
            <Button>Get Started</Button>
          </Link>
        </SignedOut>
        <SignedIn>
          <Link href="/chat">
            <Button variant="outline">Chat</Button>
          </Link>
          <UserButton />
        </SignedIn>
      </div>
    </header>
  );
};
