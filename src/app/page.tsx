"use client";
import { useState, useRef, Fragment } from "react";
import { MessagePart } from "@/app/types";
import { Button, OutlineButton } from "@/components/ui/button";
import Attachments from "@/components/Attachments";
import { AutoExpandingTextarea } from "@/components/ui/textarea";
import {
  Brain,
  File as FileIcon,
  GlobeIcon,
  ImageIcon,
  PlusIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function Home() {
  const [messages, setMessages] = useState<MessagePart[]>([]);
  const messagesRef = useRef<MessagePart[]>([]);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [prompt, setPrompt] = useState("");

  const [metaOpts, setMetaOpts] = useState<
    null | "thinking" | "webSearch" | "image"
  >(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePromptChange = (ev: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(ev.target.value);
  };

  const generateImage = async (prompt: string) => {
    try {
      setLoading(true);
      setError(null);

      // Create the user message
      const userMessage = { type: "user", content: prompt };
      const updatedMessages = [...messages, userMessage];

      // Update both state and ref with the user message
      setMessages(updatedMessages as MessagePart[]);
      messagesRef.current = updatedMessages as MessagePart[];

      const newForm = new FormData();
      newForm.append("prompt", prompt);
      if (updatedMessages.length > 0) {
        newForm.append("messages", JSON.stringify(updatedMessages));
      }
      if (attachments[0]) {
        newForm.append("attachment_one", attachments[0]);
      }
      if (attachments[1]) {
        newForm.append("attachment_two", attachments[1]);
      }
      if (attachments[2]) {
        newForm.append("attachment_three", attachments[2]);
      }
      if (attachments[3]) {
        newForm.append("attachment_four", attachments[3]);
      }
      if (attachments[4]) {
        newForm.append("attachment_five", attachments[4]);
      }
      if (attachments[5]) {
        newForm.append("attachment_six", attachments[5]);
      }
      if (attachments[6]) {
        newForm.append("attachment_seven", attachments[6]);
      }
      if (attachments[7]) {
        newForm.append("attachment_eight", attachments[7]);
      }
      if (attachments[8]) {
        newForm.append("attachment_nine", attachments[8]);
      }
      if (attachments[9]) {
        newForm.append("attachment_ten", attachments[9]);
      }

      // Generate a unique URL parameter to prevent caching
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/openai/image?t=${timestamp}`, {
        method: "POST",
        body: newForm,
      });

      if (!response.ok) {
        throw new Error("Failed to generate image");
      }

      const imageResponse = await response.json();

      // Add the image response
      const finalMessages = [
        ...updatedMessages,
        { type: "app.image.delta", content: imageResponse.url },
      ];
      messagesRef.current = finalMessages as MessagePart[];
      setMessages(finalMessages as MessagePart[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /**
   *
   * There's a bug in this code that i'm struggling to resolve in a fashionable way.
   * When I send a chat with attachments, the content gets sent to the server as "user.with_attachments"
   * and it all works fine. the data shape is something like: {type: "user.with_attachments", content: [ {type: "input_text", text: "prompt"}, {type: "input_image", image_url: "attachment_one_base64"}]}
   *
   * Thats just how it gets piped to the server, we actually destructure and reformat it like this on the server,
   * whereas on the client it was several seperate pieces of state:
   *```
   * const [attachments, setAttachments] = useState<File[]>([]);
   * const [messages, setMessages] = useState<MessagePart[]>([]);
   * const [prompt, setPrompt] = useState("");
   *```
   *
   * when it comes back from the server, its now just {type: "user", content: "prompt"}
   *
   * this is a problem because we're loosing the context on the next message
   * or it could be by design.... but its a bad design
   *
   *
   */
  const handleSubmit = async (ev?: React.FormEvent<HTMLFormElement>) => {
    if (ev) {
      ev.preventDefault();
    }

    if (metaOpts === "image") {
      await generateImage(prompt);
      return;
    }

    // preserve the user message
    let updatedMessages = messages;
    if (attachments.length > 0) {
      updatedMessages = [
        ...messages,
        { type: "user.with_attachments", content: prompt },
      ];
    } else {
      updatedMessages = [...messages, { type: "user", content: prompt }];
    }
    messagesRef.current = updatedMessages as MessagePart[];
    setMessages(updatedMessages as MessagePart[]);

    const newForm = new FormData();
    newForm.append("prompt", prompt);
    newForm.append("metaOpts", JSON.stringify(metaOpts));
    if (updatedMessages.length > 0) {
      newForm.append("messages", JSON.stringify(updatedMessages));
    }
    if (attachments[0]) {
      newForm.append("attachment_one", attachments[0]);
    }
    if (attachments[1]) {
      newForm.append("attachment_two", attachments[1]);
    }
    if (attachments[2]) {
      newForm.append("attachment_three", attachments[2]);
    }
    if (attachments[3]) {
      newForm.append("attachment_four", attachments[3]);
    }
    if (attachments[4]) {
      newForm.append("attachment_five", attachments[4]);
    }
    if (attachments[5]) {
      newForm.append("attachment_six", attachments[5]);
    }
    if (attachments[6]) {
      newForm.append("attachment_seven", attachments[6]);
    }
    if (attachments[7]) {
      newForm.append("attachment_eight", attachments[7]);
    }
    if (attachments[8]) {
      newForm.append("attachment_nine", attachments[8]);
    }
    if (attachments[9]) {
      newForm.append("attachment_ten", attachments[9]);
    }

    if (attachments.length >= 10) {
      alert("You can only upload up to 10 attachments at a time.");
      return;
    }

    const response = await fetch(`/api/openai`, {
      method: "POST",
      body: newForm,
    });

    // reset attachments & form data
    setAttachments([]);

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
    <div className="h-full flex flex-col items-center pt-8 max-w-2xl mx-auto">
      <div
        className={cn("flex-1 w-full pr-10 md:pr-0", {
          "flex justify-center items-center": messages.length === 0,
        })}
      >
        <Messages messages={messages} />
      </div>

      <div className="w-full mt-auto sticky bottom-0 bg-background pb-4 pr-10 md:pr-0">
        <div className="flex flex-col w-full">
          <form
            onSubmit={(ev) => handleSubmit(ev)}
            className="flex flex-col md:flex-row items-end gap-3 w-full"
          >
            <AutoExpandingTextarea
              value={prompt}
              onChange={handlePromptChange}
              placeholder="Enter your question here..."
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              onKeyDown={(ev) => {
                if (ev.key === "Enter" && !ev.shiftKey) {
                  ev.preventDefault();
                  handleSubmit();
                }
              }}
            />

            <div className="flex flex-col gap-2">
              {attachments.length > 0 && (
                <Badge variant="outline">
                  {attachments.length} attachments
                </Badge>
              )}

              <div className="flex items-center gap-3">
                <Attachments multiple={true} onFileSelect={setAttachments} />
                <Button
                  type="submit"
                  disabled={loading}
                  className="cursor-pointer"
                >
                  Ask
                </Button>
              </div>
            </div>
          </form>
          <div>
            <span className="text-xs text-stone-500">
              AI is known to make mistakes and hallucination information. Use
              with discretion.
            </span>
          </div>
        </div>

        {/* <div className="flex flex-wrap gap-3 mb-4">
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
                setMetaOpts("image");
              }}
            >
              Image
            </Button>
          </div>
        </div> */}
      </div>
    </div>
  );
}
const MESSAGE_TYPES = [
  "user",
  "user.with_attachments",
  "app.image.delta",
  "response.content_part.done",
  "response.output_text.delta",
] as const;

type MessageTypes = (typeof MESSAGE_TYPES)[number];

function Messages({ messages }: { messages: MessagePart[] }) {
  const determineMessageType = (message: MessagePart) => {
    switch (message.type as MessageTypes) {
      case "user":
        return (
          <div className="w-full flex items-end justify-end">
            {/* 75% is roughly the input (textarae) size we provide to the user in the interface */}
            <div className="max-w-[75%] py-2 px-4 bg-accent/70 rounded-md">
              {message.content as string}
            </div>
          </div>
        );
      case "user.with_attachments":
        return (
          <div className="w-full flex items-end justify-end relative">
            {/* 75% is roughly the input (textarae) size we provide to the user in the interface */}
            <div className="max-w-[75%] py-2 px-4 bg-accent/70 rounded-md">
              {message.content as string}
            </div>
            <FileIcon className="h-4 w-4 absolute -bottom-2 -right-2 stroke-teal-600" />
          </div>
        );
      case "app.image.delta":
        return (
          <div className="w-full h-64 relative">
            <img
              src={message.content as string}
              alt="Generated Image"
              className="w-[300px]"
            />
          </div>
        );
      case "response.content_part.done":
        const annotations = message.part?.annotations || [];

        const annotationsWithOutDuplicates = annotations.filter(
          (annotation, index, self) =>
            index === self.findIndex((t) => t.url === annotation.url)
        );

        if (!annotationsWithOutDuplicates.length) {
          return null;
        }

        return (
          <div className="text-foreground whitespace-pre-wrap">
            {message.content as string}

            {annotationsWithOutDuplicates.map((annotation, index) => (
              <div key={annotation.url}>
                <span className="text-xs bg-stone-100 text-stone-600 font-mono px-2 py-1 rounded w-fit">
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

      case "response.output_text.delta":
        if (message.content.length <= 0) {
          return null;
        }

        if (Array.isArray(message.content)) {
          return (
            <div className="text-foreground whitespace-pre-wrap">
              {JSON.stringify(message.content) as string}
            </div>
          );
        }
        return (
          <div className="text-foreground whitespace-pre-wrap">
            {message.content as string}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full space-y-4 mb-4">
      {messages.length === 0 ? (
        <div className="text-left py-8 max-w-2xl mx-auto">
          <h1 className="text-2xl font-black bg-gradient-to-r from-stone-700/50 to-stone-700/80 inline-block text-transparent bg-clip-text">
            Wussup Chat
          </h1>
          <p className="text-stone-300">
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
            <OutlineButton>
              <PlusIcon className="w-4 h-4" />
              Add API Key
            </OutlineButton>
          </div>
        </div>
      ) : (
        messages.map((message, index) => {
          if (MESSAGE_TYPES.includes(message.type as MessageTypes)) {
            return (
              <Fragment key={index}>{determineMessageType(message)}</Fragment>
            );
          }
          return null;
        })
      )}
    </div>
  );
}
