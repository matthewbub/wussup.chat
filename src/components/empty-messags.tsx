import Link from "next/link";
import { Brain, GlobeIcon, ImageIcon, PlusIcon } from "lucide-react";
import { OutlineButton } from "@/components/ui/button";

export function EmptyMessages() {
  return (
    <div className="text-left py-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-black bg-gradient-to-r from-stone-700/50 to-stone-700/80 inline-block text-transparent bg-clip-text">
        Wussup Chat
      </h1>
      <p className="text-stone-300/80">
        Ask a question to see AI responses here.
      </p>
      <p className="text-sm text-stone-500 mt-4 text-right w-full inline-block">
        (Auto) Features
      </p>
      <ul className="flex flex-col text-left divide-y divide-stone-200 dark:divide-stone-800 ">
        <li>
          <span className="flex items-center gap-2 py-2">
            <ImageIcon className="w-4 h-4 text-fuchsia-500" />
            <span className="text-sm text-stone-500">
              Generate images from text and image prompts
            </span>
          </span>
        </li>
        <li>
          <span className="flex items-center gap-2 py-2">
            <GlobeIcon className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-stone-500">
              Search the web for relevant information with citeable sources
            </span>
          </span>
        </li>
        <li>
          <span className="flex items-center gap-2 py-2">
            <Brain className="w-4 h-4 text-green-500" />
            <span className="text-sm text-stone-500">
              Think and reason about the question before responding
            </span>
          </span>
        </li>
      </ul>

      <div className="flex items-center gap-2 mt-4">
        <Link href="/settings">
          <OutlineButton>
            <PlusIcon className="w-4 h-4" />
            Add OpenAI API Key
          </OutlineButton>
        </Link>

        <Link
          href="https://platform.openai.com/api-keys"
          target="_blank"
          className="text-sm text-indigo-500 dark:text-indigo-400 hover:text-indigo-600 hover:underline"
        >
          Where do I get an OpenAI API Key?
        </Link>
      </div>
    </div>
  );
}
