import Link from "next/link";
import { SignInButton, SignUpButton, SignedOut, UserButton, SignedIn } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { useChatStore } from "@/store/chat-store";

export function ChatHeader() {
  const { chatTitle } = useChatStore();
  return (
    <header className="w-full py-4">
      <div className="container mx-auto px-4">
        <nav className="flex items-center gap-2">
          <Link href="/" className="">
            Chat
          </Link>
          <span>/</span>
          <span>{chatTitle}</span>
        </nav>

        <div className="flex flex-1 justify-end gap-4">
          <SignedOut>
            <SignInButton>
              <Button variant="ghost">Sign In</Button>
            </SignInButton>
            <SignUpButton>
              <Button variant="default">Sign Up</Button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
