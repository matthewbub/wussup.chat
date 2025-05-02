import {
  ApiChunk,
  ApiChunkSequence,
  MessagePart,
  OpenAIConfig,
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

export class Unpacker {
  private formData: FormData;

  public prompt: string;
  public metaOpts: string;
  private messagesAsJson: string;
  public messages: OpenAiMessagePart[];
  public attachments: {
    attachmentOne: File | null;
    attachmentTwo: File | null;
    attachmentThree: File | null;
    attachmentFour: File | null;
    attachmentFive: File | null;
    attachmentSix: File | null;
    attachmentSeven: File | null;
    attachmentEight: File | null;
    attachmentNine: File | null;
    attachmentTen: File | null;
  };

  constructor(formData: FormData) {
    this.formData = formData;
    this.prompt = "";
    this.metaOpts = "";
    this.messagesAsJson = "";
    this.messages = [];
    this.attachments = {
      attachmentOne: null,
      attachmentTwo: null,
      attachmentThree: null,
      attachmentFour: null,
      attachmentFive: null,
      attachmentSix: null,
      attachmentSeven: null,
      attachmentEight: null,
      attachmentNine: null,
      attachmentTen: null,
    };
  }

  unpack() {
    this.prompt = this.formData.get("prompt") as string;
    this.metaOpts = this.formData.get("metaOpts") as string;
    this.messagesAsJson = this.formData.get("messages") as string;
    console.log("this.messagesAsJson", this.messagesAsJson);
    return this;
  }

  unpackAttachments() {
    this.attachments = unpackAttachments(this.formData);
    return this;
  }

  unpackMessages() {
    try {
      this.messages = messageBuilder(
        JSON.parse(this.messagesAsJson) as MessagePart[]
      );
      console.log("this.messages", this.messages);
    } catch (error) {
      console.error(error);
      throw new Error("Failed to unpack messages");
    }
    return this;
  }
}

export class OpenAiUnpacker extends Unpacker {
  public config: OpenAIConfig;
  constructor(formData: FormData) {
    super(formData);
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
      this.prompt,
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
    messages = messageBuilder(JSON.parse(messagesAsJson) as MessagePart[]);
  }

  return {
    prompt,
    metaOpts,
    messages,
    attachments,
  };
};

export const unpackAttachments = (
  formData: FormData
): {
  attachmentOne: File | null;
  attachmentTwo: File | null;
  attachmentThree: File | null;
  attachmentFour: File | null;
  attachmentFive: File | null;
  attachmentSix: File | null;
  attachmentSeven: File | null;
  attachmentEight: File | null;
  attachmentNine: File | null;
  attachmentTen: File | null;
} => {
  // i wish this was pretty but it was a pain so here we are
  const attachmentOne = formData.get("attachment_one") as File | null;
  const attachmentTwo = formData.get("attachment_two") as File | null;
  const attachmentThree = formData.get("attachment_three") as File | null;
  const attachmentFour = formData.get("attachment_four") as File | null;
  const attachmentFive = formData.get("attachment_five") as File | null;
  const attachmentSix = formData.get("attachment_six") as File | null;
  const attachmentSeven = formData.get("attachment_seven") as File | null;
  const attachmentEight = formData.get("attachment_eight") as File | null;
  const attachmentNine = formData.get("attachment_nine") as File | null;
  const attachmentTen = formData.get("attachment_ten") as File | null;

  return {
    attachmentOne,
    attachmentTwo,
    attachmentThree,
    attachmentFour,
    attachmentFive,
    attachmentSix,
    attachmentSeven,
    attachmentEight,
    attachmentNine,
    attachmentTen,
  };
};

export const startOpenAiStream = async (
  response: AsyncIterable<ApiChunk>,
  controller: ReadableStreamDefaultController<string>
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
