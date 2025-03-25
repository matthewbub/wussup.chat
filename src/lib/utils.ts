import { auth } from "@clerk/nextjs/server";
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

export const facade = {
  humanMessage: function (input: string) {
    return {
      id: crypto.randomUUID(),
      content: input,
      role: "user" as const,
    };
  },
  aiMessage: function (input: string) {
    return {
      id: crypto.randomUUID(),
      content: input,
      role: "assistant" as const,
    };
  },
  fetchAiMessage: async function (input: string, model: string, provider: string, messages: any[], sessionId: string) {
    const formData = new FormData();
    formData.append("content", input);
    formData.append("model", model);
    formData.append("model_provider", provider);
    formData.append("messageHistory", JSON.stringify(messages));
    formData.append("session_id", sessionId);

    const response = await fetch("/api/v3/ai", {
      method: "POST",
      body: formData,
    });

    return response;
  },
  postChatInfo: function (
    sessionId: string,
    aiMessage: {
      id: string;
      content: string;
      role: string;
    },
    currentInput: string,
    usage: {
      promptTokens: number;
      completionTokens: number;
    }
  ) {
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
  },
  updateSessionTitle: async function (sessionId: string, messages: { role: string; content: string }[]) {
    const response = await fetch("/api/v3/title-gen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId, messages }),
    });

    return response;
  },
};
