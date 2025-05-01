import { MessagePart, OpenAiMessagePart } from "@/app/types";

export const messageBuilder = (messages: MessagePart[]) => {
  const parts: OpenAiMessagePart[] = [];

  for (const part of messages) {
    switch (part.type) {
      case "app.image.delta":
        parts.push(formatImageIntoMessagePart(part));
        break;
      case "user":
        parts.push({
          role: "user",
          content: part.content,
        });
        break;

      // anthropic
      case "content_block_delta":
      // open ai
      case "response.output_text.delta":
        parts.push({
          role: "assistant",
          content: part.content,
        });
        break;
      default:
        break;
    }
  }

  return parts;
};

const formatImageIntoMessagePart = (part: MessagePart): OpenAiMessagePart => {
  return {
    role: "user",
    content: [
      {
        type: "input_text",
        text: "AI Generated Image:",
      },
      {
        type: "input_image",
        image_url: part.content as string,
      },
    ],
  };
};
