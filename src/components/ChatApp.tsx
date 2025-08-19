"use client";
import { useState, useRef, useEffect } from "react";
import { MessagePart } from "@/app/types";
import { Button, OutlineButton } from "@/components/ui/button";
import Attachments from "@/components/Attachments";
import { AutoExpandingTextarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Messages } from "@/components/messages";
import { useChatStore } from "@/app/chat/Lifecycle";
import { useParams } from "next/navigation";
import { useMessageLimits } from "@/hooks/useMessageLimits";
import Link from "next/link";

export default function ChatApp() {
  const { id } = useParams();
  const { selectedChatHistory, isDisabled } = useChatStore();
  const { isOverLimit, shouldBlockAction } = useMessageLimits();
  const [messages, setMessages] = useState<MessagePart[]>([]);
  const messagesRef = useRef<MessagePart[]>([]);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMessages(selectedChatHistory?.history as unknown as MessagePart[]);
  }, [selectedChatHistory]);

  const handlePromptChange = (ev: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(ev.target.value);
  };

  const buildFormData = (
    prompt: string,
    messages: MessagePart[],
    attachments: File[]
  ) => {
    const form = new FormData();
    form.append("prompt", prompt);
    if (messages.length > 0) {
      form.append("messages", JSON.stringify(messages));
    }

    // Add attachments
    attachments.forEach((file, index) => {
      if (index < 10) {
        form.append(`attachment_${index + 1}`, file);
      }
    });

    return form;
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

    if (loading || shouldBlockAction()) {
      return;
    }

    // Store the prompt before clearing it
    const currentPrompt = prompt;
    setPrompt("");
    setLoading(true);

    // preserve the user message
    let updatedMessages = messages;
    if (attachments.length > 0) {
      updatedMessages = [
        ...messages,
        { type: "user.with_attachments", content: currentPrompt },
      ];
    } else {
      updatedMessages = [...messages, { type: "user", content: currentPrompt }];
    }
    messagesRef.current = updatedMessages as MessagePart[];
    setMessages(updatedMessages as MessagePart[]);

    const newForm = buildFormData(currentPrompt, updatedMessages, attachments);

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

    // Store the chat history
    await storeChatHistory();

    setLoading(false);
  };

  const storeChatHistory = async () => {
    const response = await fetch("/api/store", {
      method: "POST",
      body: JSON.stringify({
        history: messagesRef.current,
        chatId: id,
      }),
    });

    if (!response.ok) {
      console.error("Failed to store chat history");
    }
  };

  return (
    <div className="h-full flex flex-col items-center pt-8 max-w-2xl mx-auto">
      {isDisabled && (
        <div className="w-full mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">
            You have exceeded your daily message limit. Please upgrade to Pro.
          </p>
          <Link href="/pricing">
            <OutlineButton>View Pricing</OutlineButton>
          </Link>
        </div>
      )}

      <div
        className={cn("flex-1 w-full pr-10 md:pr-0 mr-2", {
          "flex justify-center items-center": messages && messages.length === 0,
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
              disabled={isDisabled || isOverLimit}
            />

            <div className="flex flex-col gap-2">
              {attachments.length > 0 && (
                <Badge variant="outline">
                  {attachments.length} attachments
                </Badge>
              )}

              <div className="flex items-center gap-3">
                <Attachments
                  multiple={true}
                  onFileSelect={setAttachments}
                  disabled={loading || isDisabled || isOverLimit}
                />
                <Button
                  type="submit"
                  disabled={loading || isDisabled || isOverLimit}
                  className="cursor-pointer"
                >
                  {loading ? "Loading..." : "Send"}
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
      </div>
    </div>
  );
}
