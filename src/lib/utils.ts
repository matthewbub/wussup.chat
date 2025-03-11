import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * formatContextMessages - Converts database message format to AI chat format
 */
export function formatContextMessages(
  messages: Array<{ is_user: boolean; content: string }>
): { role: "user" | "assistant"; content: string }[] {
  return messages
    .filter((msg) => msg.content.trim() !== "")
    .map((msg) => ({
      role: msg.is_user ? "user" : "assistant",
      content: msg.content,
    }));
}
