import { MessagePart, OpenAiMessagePart } from "@/app/types";

/**
 * A utility class for building OpenAI API message parts from client-side message parts.
 * This class provides methods to format different types of message parts into the appropriate OpenAI API format.
 */
export class MessageBuilder {
  /**
   * Builds the messages array for the OpenAI API from client-side message parts.
   * @private
   * @param {MessagePart[]} messages - Array of message parts from the client
   * @returns {OpenAiMessagePart[]} Array of messages in OpenAI API format
   */
  public build = (messages: MessagePart[]) => {
    const parts: OpenAiMessagePart[] = [];

    for (const part of messages) {
      switch (part.type) {
        case "app.image.delta":
          parts.push(this.formatImageIntoMessagePart(part));
          break;

        case "user":
        case "user.with_attachments":
          parts.push(this.formatUserMessageIntoMessagePart(part));
          break;

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

  /**
   * Formats a user message part into OpenAI API message format.
   * @private
   * @param {MessagePart} part - The message part to format
   * @returns {OpenAiMessagePart} The formatted message part
   */
  private formatUserMessageIntoMessagePart = (
    part: MessagePart,
  ): OpenAiMessagePart => {
    return {
      role: "user",
      content: part.content,
    };
  };

  /**
   * Formats an image message part into OpenAI API message format.
   * @private
   * @param {MessagePart} part - The image message part to format
   * @returns {OpenAiMessagePart} The formatted message part containing the image
   */
  private formatImageIntoMessagePart = (
    part: MessagePart,
  ): OpenAiMessagePart => {
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
}
