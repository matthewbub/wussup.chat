import { type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";

/**
 * Combines Tailwind CSS classes with proper precedence
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats messages for AI chat format
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
 * Processes streaming response from chat API
 */
export async function processStreamingResponse(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  onChunk: (content: string) => void,
  onMetadata?: (data: { promptTokens: number; completionTokens: number }) => void
) {
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
}

/**
 * Creates a human message object
 */
export function createHumanMessage(input: string) {
  return {
    id: crypto.randomUUID(),
    content: input,
    role: "user" as const,
  };
}

/**
 * Creates an AI message object
 */
export function createAiMessage(input: string) {
  return {
    id: crypto.randomUUID(),
    content: input,
    role: "assistant" as const,
  };
}

/**
 * Fetches AI message from the API
 */
export async function fetchAiMessage({
  input,
  model,
  provider,
  messages,
  sessionId,
  checkOnly,
}: {
  input: string;
  model: string;
  provider: string;
  messages: Array<{ id: string; content: string; role: "user" | "assistant" }>;
  sessionId: string;
  checkOnly?: boolean;
}) {
  const formData = new FormData();
  formData.append("content", input);
  formData.append("model", model);
  formData.append("model_provider", provider);
  formData.append("messageHistory", JSON.stringify(messages));
  formData.append("session_id", sessionId);

  if (checkOnly) {
    formData.append("checkOnly", "true");
  }

  return fetch("/api/v3/ai", {
    method: "POST",
    body: formData,
  });
}

/**
 * Posts chat info to the API
 */
export function postChatInfo({
  sessionId,
  aiMessage,
  currentInput,
  usage,
}: {
  sessionId: string;
  aiMessage: { id: string; content: string; role: "assistant" };
  currentInput: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
  };
}) {
  fetch("/api/v3/info", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId,
      aiMessage: {
        ...aiMessage,
        input: currentInput,
        output: aiMessage.content,
        prompt_tokens: usage.promptTokens,
        completion_tokens: usage.completionTokens,
      },
    }),
  }).catch(console.error);
}
