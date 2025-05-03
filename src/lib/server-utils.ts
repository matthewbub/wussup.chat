import {
  ApiChunk,
  ApiChunkSequence,
  MessagePart,
  OpenAIConfig,
  OpenAiMessageContentAsAttachments,
  OpenAiMessagePart,
} from "@/app/types";
import { appConfig } from "@/constants/app-config";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

export const messageBuilder = (messages: MessagePart[]) => {
  const parts: OpenAiMessagePart[] = [];

  for (const part of messages) {
    switch (part.type) {
      case "app.image.delta":
        parts.push(formatImageIntoMessagePart(part));
        break;

      case "user":
        parts.push(formatUserMessageIntoMessagePart(part));
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

const formatUserMessageIntoMessagePart = (
  part: MessagePart
): OpenAiMessagePart => {
  return {
    role: "user",
    content: part.content,
  };
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

export class Unpacker {
  private formData: FormData;

  public prompt: string;
  public metaOpts: string;
  private messagesAsJson: string;
  public messages: OpenAiMessagePart[];
  public attachments: { name: string; content: string }[];
  constructor(formData: FormData) {
    this.formData = formData;
    this.prompt = "";
    this.metaOpts = "";
    this.messagesAsJson = "";
    this.messages = [];
    this.attachments = [];
  }

  async unpack() {
    this.prompt = this.formData.get("prompt") as string;
    this.metaOpts = this.formData.get("metaOpts") as string;
    this.messagesAsJson = this.formData.get("messages") as string;

    // this has to be done before unpacking messages
    // because we need this data to potentially mutate the last user message
    await this.unpackAttachments();

    this.unpackMessages();
    return this;
  }

  get() {
    return {
      messages: this.messages,
      metaOpts: this.metaOpts,
    };
  }

  async unpackAttachments() {
    this.attachments = await unpackAttachments(this.formData);
    return this;
  }

  unpackMessages() {
    try {
      this.messages = messageBuilder(
        JSON.parse(this.messagesAsJson) as MessagePart[]
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
}

export class OpenAiStreamer {
  public config: OpenAIConfig;
  public messages: OpenAiMessagePart[];
  public metaOpts: string;

  constructor({
    messages,
    metaOpts,
  }: {
    messages: OpenAiMessagePart[];
    metaOpts: string;
  }) {
    this.messages = messages;
    this.metaOpts = metaOpts;
    this.config = {
      model: "",
      stream: true,
      input: [],
      user: "",
    };
  }

  readyOpenAiConfig(userId: string) {
    this.config = buildOpenAiConfig(
      this.messages,
      "TODO REMOVE ME",
      this.metaOpts,
      userId
    );
    return this;
  }

  async createOpenAiResponse(
    apiKey: string | undefined = process.env.OPENAI_API_KEY
  ) {
    const openai = new OpenAI({
      apiKey: apiKey,
    });

    // @ts-expect-error The OpenAI SDK types don't match our usage
    const response = await openai.responses.create(this.config);
    return response;
  }
}

export class AnthropicUnpacker extends Unpacker {
  public config: Anthropic.MessageCreateParamsStreaming;
  constructor(formData: FormData) {
    super(formData);
    this.config = {
      model: "",
      stream: true,
      messages: [],
      max_tokens: 2000,
    };
  }

  readyAnthropicConfig() {
    this.config = buildAnthropicConfig(this.messages, this.metaOpts);
    return this;
  }

  async createAnthropicResponse() {
    const anthropic = new Anthropic();
    const response = await anthropic.messages.create(this.config);
    return response;
  }
}

export const unpackFormData = (formData: FormData) => {
  const prompt = formData.get("prompt") as string;
  const metaOpts = formData.get("metaOpts") as string;
  const messagesAsJson = formData.get("messages") as string;
  const attachments = unpackAttachments(formData);

  let messages: OpenAiMessagePart[] = [];
  if (messagesAsJson) {
    messages = messageBuilder(
      JSON.parse(messagesAsJson) as MessagePart[],
      attachments
    );
  }

  return {
    prompt,
    metaOpts,
    messages,
    attachments,
  };
};

export const unpackAttachments = async (
  formData: FormData
): Promise<{ name: string; content: string }[]> => {
  const attachments = [
    formData.get("attachment_one") as File | null,
    formData.get("attachment_two") as File | null,
    formData.get("attachment_three") as File | null,
    formData.get("attachment_four") as File | null,
    formData.get("attachment_five") as File | null,
    formData.get("attachment_six") as File | null,
    formData.get("attachment_seven") as File | null,
    formData.get("attachment_eight") as File | null,
    formData.get("attachment_nine") as File | null,
    formData.get("attachment_ten") as File | null,
  ].filter((attachment) => attachment !== null);

  const base64Attachments = await Promise.all(
    attachments.map(async (attachment) => {
      const arrayBuffer = await attachment.arrayBuffer();
      const base64 = arrayBufferToBase64(arrayBuffer);
      return {
        name: attachment.name,
        content: `data:${attachment.type};base64,${base64}`,
      };
    })
  );

  return base64Attachments;
};

// https://stackoverflow.com/questions/9267899/how-can-i-convert-an-arraybuffer-to-a-base64-encoded-string
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export const streamOpenAiResponse = async (
  controller: ReadableStreamDefaultController<string>,
  response: AsyncIterable<ApiChunk>
) => {
  const sequences: ApiChunkSequence[] = [];
  let currentType: string | null = null;
  let currentContent = "";

  const updateSequence = (type: string) => {
    // if the type has changed, push what we had collected into the sequences array
    // and prepare to collect the next type
    if (currentType) {
      sequences.push({
        type: currentType,
        content: currentContent,
      });
    }
    if (currentType !== type) {
      currentType = type;
      currentContent = "";
    }
  };

  for await (const chunk of response as unknown as AsyncIterable<ApiChunk>) {
    updateSequence(chunk.type);

    const delta = chunk?.delta ?? "";
    if (delta) {
      // continuously add to the current content until the type changes
      // this means we don't have to be additive on the client side
      // we can just replace the content with the new chunk
      currentContent += delta;
    }

    controller.enqueue(
      `data: ${JSON.stringify({
        type: chunk.type,
        sequences: [
          ...sequences,
          {
            type: currentType,
            content: currentContent,
            part: chunk?.part ?? null,
          },
        ],
      })}\n\n`
    );
  }
  controller.close();
};

export const buildOpenAiConfig = (
  messages: OpenAiMessagePart[],
  prompt: string,
  metaOpts: string,
  userId: string
) => {
  const opConfig: OpenAIConfig = {
    model: appConfig.openai.thinkingModel,
    stream: true as const,
    input: messages,
    // https://platform.openai.com/docs/guides/safety-best-practices#end-user-ids
    user: userId,
  };

  if (metaOpts === "thinking") {
    opConfig.model = appConfig.openai.thinkingModel;
    opConfig.reasoning = {
      effort: "medium",
      summary: "auto",
    };
  }

  if (metaOpts === "webSearch") {
    opConfig.model = appConfig.openai.webModel;
    opConfig.tools = [{ type: "web_search_preview" }];
  }

  return opConfig;
};

export const buildAnthropicConfig = (
  messages: OpenAiMessagePart[],
  metaOpts: string
) => {
  const config = {
    model: "claude-3-7-sonnet-20250219",
    max_tokens: 2000,
    messages: messages,
    stream: true,
  } as Anthropic.MessageCreateParamsStreaming;

  if (metaOpts === "thinking") {
    config.thinking = {
      type: "enabled",
      budget_tokens: 1600,
    };
  }

  return config;
};

export const startAnthropicStream = async (
  response: AsyncIterable<ApiChunk>,
  controller: ReadableStreamDefaultController<string>
) => {
  const sequences: { type: string; content: string }[] = [];
  let currentType: string | null = null;
  let currentContent = "";

  const updateSequence = (type: string) => {
    // if the type has changed, push what we had collected into the sequences array
    // and prepare to collect the next type
    if (currentType && currentType !== type) {
      sequences.push({
        type: currentType,
        content: currentContent,
      });
      currentContent = "";
    }

    currentType = type;
  };

  for await (const chunk of response as unknown as AsyncIterable<{
    type: string;
    delta?: { thinking?: string; text?: string };
  }>) {
    updateSequence(chunk.type);
    // continuously add to the current content until the type changes
    // this means we don't have to be additive on the client side
    // we can just replace the content with the new chunk
    currentContent += chunk?.delta?.thinking || chunk?.delta?.text || "";

    controller.enqueue(
      `data: ${JSON.stringify({
        type: chunk.type,
        sequences: [
          ...sequences,
          {
            type: currentType,
            content: currentContent,
          },
        ],
      })}\n\n`
    );
  }
  controller.close();
};
