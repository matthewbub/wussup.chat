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

/**
 * processes streaming response from chat api
 */
export const processStreamingResponse = async (
  reader: ReadableStreamDefaultReader<Uint8Array>,
  onChunk: (content: string) => void,
  onMetadata?: (data: { promptTokens: number; completionTokens: number }) => void
) => {
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split("\n").filter((line) => line.trim() !== "");

    for (const line of lines) {
      try {
        if (line.startsWith("0")) {
          const data = line.slice(3, -1);
          if (data === "[DONE]") break;

          const cleanedData = data.replace(/\\n/g, "\n");
          onChunk(cleanedData);
        } else if (line.startsWith("e:") || line.startsWith("d:")) {
          const eventData = JSON.parse(line.slice(2));
          if (eventData.usage && onMetadata) {
            onMetadata(eventData.usage);
          }
        }
      } catch (e) {
        console.error("Error parsing chunk:", e);
      }
    }
  }
};
