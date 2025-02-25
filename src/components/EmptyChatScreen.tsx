"use client";
import { PROMPTS } from "@/constants/prompts";
import { useEffect, useState } from "react";

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random#getting_a_random_integer_between_two_values
function getRandomInt(min: number, max: number) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
}

function randomPromptGenerator(count: number, prompts: string[]) {
  const availablePrompts = [...prompts]; // Create a copy to modify
  const randomPrompts: string[] = [];

  // Only try to get as many prompts as available
  const targetCount = Math.min(count, prompts.length);

  while (randomPrompts.length < targetCount && availablePrompts.length > 0) {
    const randomIndex = getRandomInt(0, availablePrompts.length);
    randomPrompts.push(availablePrompts[randomIndex]);
    // Remove the used prompt to prevent duplicates
    availablePrompts.splice(randomIndex, 1);
  }

  return randomPrompts;
}
const promptList = Object.values(PROMPTS).flat();

export function EmptyChatScreen({ setNewMessage }: { setNewMessage: (message: string) => void }) {
  // prevent hydration errors
  // this is annoying as fuck
  const [prompts, setPrompts] = useState<string[]>([]);
  useEffect(() => {
    const randomPrompts = randomPromptGenerator(4, promptList);
    setPrompts(randomPrompts);
  }, []);

  return (
    <div className="flex-1 flex items-center justify-center">
      <div className=" w-full p-8">
        <div className="flex flex-col items-center justify-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 text-center">
            Start a New Conversation
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
            Don&apos;t know what to ask? Try one of these prompts:
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {prompts.map((prompt) => (
            <button
              key={prompt}
              className="px-4 py-2 text-center rounded-full border border-gray-200 dark:border-gray-700
                           hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors
                           text-gray-700 dark:text-gray-300"
              onClick={() => {
                setNewMessage(prompt);
              }}
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
