"use client";
import { useState, useRef } from "react";
import { MessagePart } from "@/app/types";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";

export default function Home() {
  const [model, setModel] = useState<"openai" | "anthropic">("openai");
  const [messages, setMessages] = useState<MessagePart[]>([]);
  const messagesRef = useRef<MessagePart[]>([]);

  // Replace the prompt state with React Hook Form
  const { register, handleSubmit, watch } = useForm({
    defaultValues: {
      prompt: "",
    },
  });

  const [metaOpts, setMetaOpts] = useState<
    null | "thinking" | "webSearch" | "image"
  >(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateImage = async (prompt: string) => {
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

      const imageResponse = await response.json();

      // set the image as the last message
      setMessages([
        ...messages,
        { type: "app.image.delta", content: imageResponse.url },
      ]);
      // setImageUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Modify the handleClick to work with React Hook Form
  const onSubmit = async (data: { prompt: string }) => {
    // preserve the user message
    const updatedMessages = [
      ...messages,
      { type: "user", content: data.prompt },
    ];
    setMessages(updatedMessages as MessagePart[]);
    messagesRef.current = updatedMessages as MessagePart[];

    if (metaOpts === "image") {
      await generateImage(data.prompt);
      return;
    }

    const response = await fetch(`/api/${model}`, {
      method: "POST",
      body: JSON.stringify({ prompt: data.prompt, metaOpts, messages }),
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
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col md:flex-row gap-3 mb-4"
        >
          <input
            {...register("prompt")}
            type="text"
            placeholder="Enter your question here..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button type="submit" disabled={loading}>
            Ask AI
          </Button>
        </form>

        <div className="flex flex-wrap gap-3 mb-4">
          <div className="flex items-center border rounded-lg p-1 bg-background space-x-2">
            <Button
              type="button"
              variant={model === "openai" ? "default" : "outline"}
              onClick={() => setModel("openai")}
            >
              OpenAI
            </Button>
            <Button
              type="button"
              variant={model === "anthropic" ? "default" : "outline"}
              disabled={metaOpts === "image"}
              onClick={() => setModel("anthropic")}
            >
              Anthropic
            </Button>
          </div>

          <div className="flex items-center border rounded-lg p-1 bg-background space-x-2">
            <Button
              variant={metaOpts === null ? "default" : "outline"}
              onClick={() => {
                setMetaOpts(null);
              }}
            >
              None
            </Button>
            <Button
              variant={metaOpts === "webSearch" ? "default" : "outline"}
              onClick={() => {
                setMetaOpts("webSearch");
              }}
            >
              Web Search
            </Button>
            <Button
              variant={metaOpts === "thinking" ? "default" : "outline"}
              onClick={() => {
                setMetaOpts("thinking");
              }}
            >
              Thinking
            </Button>
            <Button
              variant={metaOpts === "image" ? "default" : "outline"}
              onClick={() => {
                // force openai for image generation
                setModel("openai");
                setMetaOpts("image");
              }}
            >
              Image
            </Button>
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
