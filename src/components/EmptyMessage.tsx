"use client";
import { Brain, GlobeIcon, ImageIcon } from "lucide-react";

export function EmptyMessage() {
  return (
    <div className="text-left py-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-black dark:text-stone-100">Wussup Chat</h1>
      <p className="text-muted-foreground">
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
    </div>
  );
}
