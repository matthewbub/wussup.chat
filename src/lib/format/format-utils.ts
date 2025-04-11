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
          // this was fine for awhile but now we're getting both lines and
          // as a result its fucking with the dataset so we're goonna remove one
          // } else if (line.startsWith("e:") || line.startsWith("d:")) {
        } else if (line.startsWith("d:")) {
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
 * Fetches AI message from the API
 */
export async function fetchAiMessage({
  input,
  model,
  provider,
  messages,
  sessionId,
}: {
  input: string;
  model: string;
  provider: string;
  messages: Array<{ id: string; content: string; role: "user" | "assistant" }>;
  sessionId: string;
  checkOnly?: boolean;
}): Promise<Response> {
  const formData = new FormData();
  formData.append("content", input);
  formData.append("model", model);
  formData.append("model_provider", provider);
  formData.append("messageHistory", JSON.stringify(messages));
  formData.append("session_id", sessionId);

  return fetch("/api/v3/ai", {
    method: "POST",
    body: formData,
  });
}
