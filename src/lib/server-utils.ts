import { MessagePart } from "@/app/page";

export const messageBuilder = (messages: MessagePart[]) =>
  messages
    .filter(
      (message: MessagePart) =>
        // only include user messages and final AI response
        message.type === "user" ||
        // open ai
        message.type === "response.output_text.delta" ||
        // anthropic
        message.type === "content_block_delta"
    )
    .map((message: MessagePart) => ({
      role: message.type === "user" ? "user" : "assistant",
      content: message.content,
    }));
