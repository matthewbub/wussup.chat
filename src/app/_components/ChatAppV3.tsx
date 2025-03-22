"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SignInButton } from "@clerk/nextjs";
import { SignUpButton } from "@clerk/nextjs";
import { SignedOut } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";
import { SignedIn } from "@clerk/nextjs";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import Markdown from "react-markdown";

// as simple as possible
const ChatAppV3 = () => {
  return (
    <div className="grid grid-cols-12">
      <aside className="col-span-3">
        <div>
          <h2>Wussup Chat</h2>
        </div>
        <div>
          <Button variant="outline">
            <PlusIcon />
            New Chat
          </Button>
        </div>

        <div>
          <ul>
            <li>
              <Link href="/chat/1">Chat 1</Link>
            </li>
          </ul>
        </div>
      </aside>

      <main className="col-span-9">
        <header className="flex items-center justify-between">
          <h1>Chat 1</h1>

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
              <Button variant="ghost" asChild>
                <Link href="/chat">Chat</Link>
              </Button>
              <UserButton />
            </SignedIn>
          </div>
        </header>

        <div className="flex flex-col gap-4 p-4">
          {[
            {
              content: "Hi! I need help with React hooks. Can you explain useEffect?",
              role: "user",
            },
            {
              content:
                "I'll explain useEffect with a simple example:\n\n```javascript\nuseEffect(() => {\n  // This runs after every render\n  console.log('Component mounted');\n  \n  return () => {\n    // This cleanup runs before unmount\n    console.log('Component will unmount');\n  };\n}, []);\n```\n\nThe empty dependency array `[]` means it only runs once on mount. Does this help?",
              role: "assistant",
            },
            {
              content: "Yes, that makes sense! What about if I want to run it when some data changes?",
              role: "user",
            },
            {
              content:
                "To run the effect when data changes, add the dependencies to the array:\n\n```javascript\nuseEffect(() => {\n  console.log('Data changed:', data);\n}, [data]); // Runs when 'data' changes\n```\n\nYou can add multiple dependencies separated by commas. Just be careful of infinite loops!",
              role: "assistant",
            },
          ].map((message, index) => (
            <div key={index} className="flex justify-end">
              <div className="max-w-[80%] rounded-lg bg-primary p-3 text-primary-foreground">
                <p className="text-sm font-medium">{message.role}</p>
                <Markdown>{message.content}</Markdown>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Input type="text" placeholder="Message" />
          <Button>Send</Button>
        </div>
      </main>
    </div>
  );
};

export default ChatAppV3;
