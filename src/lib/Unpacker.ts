import {
  MessagePart,
  OpenAiMessageContentAsAttachments,
  OpenAiMessagePart,
} from "@/app/types";
import { MessageBuilder } from "./MessageBuilder";
import { toFile } from "openai";
import { FileLike } from "openai/uploads.mjs";

/**
 * A utility class for unpacking and processing form data containing messages and attachments.
 * This class handles the conversion of form data into a format suitable for OpenAI API calls,
 * including processing of text messages, images, and other attachments.
 */
export class Unpacker {
  private formData: FormData;

  /** The main prompt text from the form data */
  public prompt: string;

  /** Raw JSON string of messages from the form data */
  private messagesAsJson: string;

  /** Processed messages in OpenAI API format */
  public messages: OpenAiMessagePart[];

  /** Processed attachments with base64 encoded content */
  public attachments: { name: string; content: string }[];

  /** Processed images as files */
  public images: { name: string; content: FileLike }[];

  /**
   * Creates a new Unpacker instance.
   * @param formData - The FormData object containing the message data and attachments
   */
  constructor(formData: FormData) {
    this.formData = formData;
    this.prompt = "";
    this.messagesAsJson = "";
    this.messages = [];
    this.attachments = [];
    this.images = [];
  }

  /**
   * Unpacks the form data, processing messages and attachments.
   * This method must be called before using any other functionality.
   * @returns {Promise<Unpacker>} The current Unpacker instance for method chaining
   */
  public async unpack() {
    this.prompt = this.formData.get("prompt") as string;
    this.messagesAsJson = JSON.parse(this.formData.get("messages") as string);

    // this has to be done before unpacking messages
    // because we need this data to potentially mutate the last user message
    await Promise.all([this.unpackAttachments(), this.unpackImagesToFiles()]);

    this.unpackMessages();
    return this;
  }

  /**
   * Returns the processed messages and metadata options.
   * @returns {Object} An object containing the processed messages and metadata options
   */
  public get() {
    return {
      messages: this.messages,
    };
  }

  /**
   * Processes and converts attachments from the form data into base64 encoded strings.
   * @private
   * @returns {Promise<Unpacker>} The current Unpacker instance for method chaining
   */
  private async unpackAttachments() {
    const attachments = [
      this.formData.get("attachment_1") as File | null,
      this.formData.get("attachment_2") as File | null,
      this.formData.get("attachment_3") as File | null,
      this.formData.get("attachment_4") as File | null,
      this.formData.get("attachment_5") as File | null,
      this.formData.get("attachment_6") as File | null,
      this.formData.get("attachment_7") as File | null,
      this.formData.get("attachment_8") as File | null,
      this.formData.get("attachment_9") as File | null,
      this.formData.get("attachment_10") as File | null,
    ].filter((attachment) => attachment !== null);

    const base64Attachments = await Promise.all(
      attachments.map(async (attachment) => {
        const arrayBuffer = await attachment.arrayBuffer();
        const base64 = this.arrayBufferToBase64(arrayBuffer);
        return {
          name: attachment.name,
          content: `data:${attachment.type};base64,${base64}`,
        };
      }),
    );

    this.attachments = base64Attachments;

    return this;
  }

  /**
   * Processes and converts attachments from the form data into base64 encoded strings.
   * @private
   * @returns {Promise<Unpacker>} The current Unpacker instance for method chaining
   */
  private async unpackImagesToFiles() {
    const attachments = [
      this.formData.get("attachment_1") as File | null,
      this.formData.get("attachment_2") as File | null,
      this.formData.get("attachment_3") as File | null,
      this.formData.get("attachment_4") as File | null,
      this.formData.get("attachment_5") as File | null,
      this.formData.get("attachment_6") as File | null,
      this.formData.get("attachment_7") as File | null,
      this.formData.get("attachment_8") as File | null,
      this.formData.get("attachment_9") as File | null,
      this.formData.get("attachment_10") as File | null,
    ].filter((attachment) => attachment !== null);

    // Filter valid image files
    const validAttachments = attachments.filter((attachment) => {
      const validTypes = ["image/png", "image/webp", "image/jpeg"];
      const maxSize = 25 * 1024 * 1024; // 25MB in bytes
      return validTypes.includes(attachment.type) && attachment.size <= maxSize;
    });

    const images = await Promise.all(
      validAttachments.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        return await toFile(new Blob([arrayBuffer]), file.name, {
          type: file.type,
        });
      }),
    );
    this.images = images.map((image, index) => ({
      name: validAttachments[index].name,
      content: image,
    }));

    return this;
  }

  /**
   * Processes the raw messages JSON into OpenAI API compatible message format.
   * If attachments are present, they are added to the last user message.
   * @private
   * @returns {Unpacker} The current Unpacker instance for method chaining
   * @throws {Error} If message processing fails
   */
  private unpackMessages() {
    try {
      const messageBuilder = new MessageBuilder();
      this.messages = messageBuilder.build(
        this.messagesAsJson as unknown as MessagePart[],
      );

      // if there are attachments, replace the last user message with the attachments
      if (this.attachments.length > 0) {
        this.messages[this.messages.length - 1] = {
          role: "user",
          content: [
            {
              type: "input_text",
              // take the last user message and treat it as the "prompt" for the attachments
              text: this.messages[this.messages.length - 1].content as string,
            },
            ...this.attachments.map((attachment) => ({
              type: "input_image" as const,
              image_url: attachment.content,
            })),
          ] as OpenAiMessageContentAsAttachments,
        };
      }
    } catch (error) {
      console.error(error);
      throw new Error("Failed to unpack messages");
    }
    return this;
  }

  /**
   * Converts an ArrayBuffer to a base64 encoded string.
   * @private
   * @param {ArrayBuffer} buffer - The buffer to convert
   * @returns {string} The base64 encoded string
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
}
