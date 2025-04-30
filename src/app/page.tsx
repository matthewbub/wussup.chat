"use client";
import { Annotation } from "@/app/types";
import { useState, useRef } from "react";

export interface MessagePart {
  type:
    | "response.in_progress"
    | "response.reasoning_summary_text.delta"
    | "response.output_text.delta"
    | "app.image.delta" // open ai completion response
    | "response.content_part.done"
    | "content_block_delta" // anthropic completion response
    | "user";
  content: string;
  part?: {
    annotations?: Annotation[];
    type?: string;
    text?: string;
  };
}

export default function Home() {
  const [model, setModel] = useState<"openai" | "anthropic">("openai");
  const [messages, setMessages] = useState<MessagePart[]>([]);
  const messagesRef = useRef<MessagePart[]>([]);
  const [prompt, setPrompt] = useState("");

  const [metaOpts, setMetaOpts] = useState<
    null | "thinking" | "webSearch" | "image"
  >(null);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateImage = async () => {
    try {
      setLoading(true);
      setError(null);
      setMessages([...messages, { type: "user", content: prompt }]);

      // Generate a unique URL parameter to prevent caching
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/openai/image?t=${timestamp}`, {
        method: "POST",
        body: JSON.stringify({ prompt, messages }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate image");
      }

      const imageBlob = await response.blob();
      const url = URL.createObjectURL(imageBlob);

      // set the image as the last message
      setMessages([...messages, { type: "app.image.delta", content: url }]);
      // setImageUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = async () => {
    // messagesRef.current = [];
    setMessages([...messages, { type: "user", content: prompt }]);

    if (metaOpts === "image") {
      await generateImage();
      return;
    }

    const response = await fetch(`/api/${model}`, {
      method: "POST",
      body: JSON.stringify({ prompt, metaOpts, messages }),
    });

    const reader = response.body?.getReader();
    if (!reader) return;

    const decoder = new TextDecoder();
    let buffer = ""; // Buffer for incomplete lines/events

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      // Add chunk to buffer and decode
      buffer += decoder.decode(value, { stream: true });

      // Process complete events in the buffer
      let boundary = buffer.indexOf("\n\n");
      let changed = false; // Track changes within this chunk processing cycle

      while (boundary !== -1) {
        const completeEvent = buffer.substring(0, boundary); // Get the complete event line(s)
        buffer = buffer.substring(boundary + 2); // Remove the event and delimiter from buffer

        if (completeEvent.startsWith("data: ")) {
          try {
            const data = JSON.parse(completeEvent.slice(6));
            if (!data.sequences || data.sequences.length === 0) continue;

            const currentSequence = data.sequences[data.sequences.length - 1];
            const currentType = currentSequence.type as MessagePart["type"];
            const currentPart = currentSequence.part as MessagePart["part"];
            const currentContentDelta = currentSequence.content || "";

            // --- Refined Logic Applied Directly to messagesRef.current ---
            const currentAccumulated = messagesRef.current;
            const lastMessage =
              currentAccumulated[currentAccumulated.length - 1];

            // If the last message exists and has the same type
            if (lastMessage && lastMessage.type === currentType) {
              // Always append content if the type matches, handles deltas and potentially non-delta content updates if API sends them.
              // Filter out adding empty deltas if needed, though usually harmless.
              if (currentContentDelta) {
                lastMessage.content = currentContentDelta;
                changed = true;
              }
            } else {
              // Type is different, or it's the first message
              // Add a new message part, using the delta as the initial content.
              currentAccumulated.push({
                type: currentType,
                content: currentContentDelta,
                part: currentPart,
              });
              changed = true;
            }
            // --- End of logic on ref ---
          } catch (e) {
            console.error("Failed to parse JSON line:", completeEvent, e);
          }
        }
        // Look for the next event boundary in the updated buffer
        boundary = buffer.indexOf("\n\n");
      } // End while boundary !== -1

      // Update React state ONCE after processing all complete events found in the chunk
      if (changed) {
        setMessages([...messagesRef.current]);
      }
    } // End while true (stream reading loop)
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">AI Reasoning Demo</h1>

      <div className="w-full mb-6">
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <input
            type="text"
            placeholder="Enter your question here..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <button
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            onClick={handleClick}
          >
            Ask AI
          </button>
        </div>

        <div className="flex flex-wrap gap-3 mb-4">
          <div className="flex items-center border rounded-lg p-1 bg-gray-50">
            <button
              className={`px-3 py-1 rounded ${
                model === "openai" ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
              onClick={() => setModel("openai")}
            >
              OpenAI
            </button>
            <button
              className={`px-3 py-1 rounded ${
                model === "anthropic" ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
              onClick={() => setModel("anthropic")}
            >
              Anthropic
            </button>
          </div>

          <div className="flex items-center border rounded-lg p-1 bg-gray-50">
            <button
              className={`px-3 py-1 rounded ${
                metaOpts === null ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
              onClick={() => {
                setMetaOpts(null);
              }}
            >
              None
            </button>
            <button
              className={`px-3 py-1 rounded ${
                metaOpts === "webSearch"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200"
              }`}
              onClick={() => {
                setMetaOpts("webSearch");
              }}
            >
              Web Search
            </button>
            <button
              className={`px-3 py-1 rounded ${
                metaOpts === "thinking"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200"
              }`}
              onClick={() => {
                setMetaOpts("thinking");
              }}
            >
              Thinking
            </button>
            <button
              className={`px-3 py-1 rounded ${
                metaOpts === "image" ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
              onClick={() => setMetaOpts("image")}
            >
              Image
            </button>
          </div>
        </div>
      </div>

      <Messages messages={messages} />
    </div>
  );
}

function Messages({ messages }: { messages: MessagePart[] }) {
  const determineMessageType = (message: MessagePart) => {
    switch (message.type) {
      case "app.image.delta":
        return (
          <div className="w-full h-64 relative">
            <img src={message.content} alt="Generated Image" />
          </div>
        );
      case "response.content_part.done":
        const annotations = message.part?.annotations || [];

        const annotationsWithOutDuplicates = annotations.filter(
          (annotation, index, self) =>
            index === self.findIndex((t) => t.url === annotation.url)
        );

        return (
          <div className="text-foreground whitespace-pre-wrap">
            {message.content}

            {annotationsWithOutDuplicates.map((annotation, index) => (
              <div key={annotation.url}>
                <span className="text-xs bg-gray-100 text-gray-600 font-mono px-2 py-1 rounded w-fit">
                  {"message.part?.annotations[" + index + "].type:"}
                  {annotation.type}

                  <br />
                  {"message.part?.annotations[" + index + "].title:"}
                </span>
                <a
                  href={annotation.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {annotation.title}
                </a>
              </div>
            ))}
          </div>
        );
      default:
        return (
          <div className="text-foreground whitespace-pre-wrap">
            {message.content}
          </div>
        );
    }
  };

  return (
    <div className="w-full space-y-4 p-4 rounded-lg border max-h-[500px] overflow-y-auto">
      {messages.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          Ask a question to see AI responses here
        </div>
      ) : (
        messages.map((message, index) => (
          <div
            key={index}
            className="flex flex-col gap-2 border rounded-lg p-3"
          >
            <span className="text-xs bg-gray-100 text-gray-600 font-mono px-2 py-1 rounded w-fit">
              {message.type}
            </span>
            {determineMessageType(message)}
          </div>
        ))
      )}
    </div>
  );
}
