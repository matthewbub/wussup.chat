import {
  ApiChunk,
  ApiChunkSequence,
  MessagePart,
  OpenAIConfig,
  OpenAiMessageContentAsAttachments,
  OpenAiMessagePart,
} from "@/app/types";
import { appConfig } from "@/constants/app-config";
import OpenAI from "openai";
import { Tool } from "openai/resources/responses/responses.mjs";

// this is a helper function to build the messages array for the openai api
// from the client to the server (NOT vice versa)
export const messageBuilder = (messages: MessagePart[]) => {
  const parts: OpenAiMessagePart[] = [];

  for (const part of messages) {
    switch (part.type) {
      case "app.image.delta":
        parts.push(formatImageIntoMessagePart(part));
        break;

      case "user":
      case "user.with_attachments":
        parts.push(formatUserMessageIntoMessagePart(part));
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

const formatUserMessageIntoMessagePart = (
  part: MessagePart
): OpenAiMessagePart => {
  console.log("message part content", part.content);
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

  public async unpack() {
    this.prompt = this.formData.get("prompt") as string;
    this.metaOpts = JSON.parse(this.formData.get("metaOpts") as string);
    this.messagesAsJson = JSON.parse(this.formData.get("messages") as string);

    // this has to be done before unpacking messages
    // because we need this data to potentially mutate the last user message
    await this.unpackAttachments();

    this.unpackMessages();
    return this;
  }

  public get() {
    return {
      messages: this.messages,
      metaOpts: this.metaOpts,
    };
  }

  private async unpackAttachments() {
    this.attachments = await unpackAttachments(this.formData);
    return this;
  }

  private unpackMessages() {
    try {
      this.messages = messageBuilder(
        this.messagesAsJson as unknown as MessagePart[]
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
  public prompt: string;

  constructor({
    messages,
    metaOpts,
    prompt,
  }: {
    messages: OpenAiMessagePart[];
    metaOpts: string;
    prompt: string;
  }) {
    this.prompt = prompt;
    this.messages = messages;
    this.metaOpts = metaOpts;
    this.config = {
      model: "",
      stream: true,
      input: [],
      user: "",
    };
  }

  async readyOpenAiConfig(userId: string) {
    this.config = await buildOpenAiConfig(
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
    console.log("this.config", this.config);
    const openai = new OpenAI({
      apiKey: apiKey,
    });

    // @ts-expect-error The OpenAI SDK types don't match our usage
    const response = await openai.responses.create(this.config);
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

export const unpackAttachments = async (
  formData: FormData
): Promise<{ name: string; content: string }[]> => {
  const attachments = [
    formData.get("attachment_1") as File | null,
    formData.get("attachment_2") as File | null,
    formData.get("attachment_3") as File | null,
    formData.get("attachment_4") as File | null,
    formData.get("attachment_5") as File | null,
    formData.get("attachment_6") as File | null,
    formData.get("attachment_7") as File | null,
    formData.get("attachment_8") as File | null,
    formData.get("attachment_9") as File | null,
    formData.get("attachment_10") as File | null,
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

export const buildOpenAiConfig = async (
  messages: OpenAiMessagePart[],
  prompt: string,
  metaOpts: string,
  userId: string
) => {
  // call openai to get desired model
  const modelType = await determineModel(prompt);

  const opConfig: OpenAIConfig = {
    model: appConfig.openai.thinkingModel,
    stream: true as const,
    input: messages,
    // https://platform.openai.com/docs/guides/safety-best-practices#end-user-ids
    user: userId,
  };

  if (modelType === "thinking") {
    opConfig.model = appConfig.openai.thinkingModel;
    opConfig.reasoning = {
      effort: "medium",
      summary: "auto",
    };
  }

  if (modelType === "webSearch") {
    opConfig.model = appConfig.openai.webModel;
    opConfig.tools = [{ type: "web_search_preview" }];
  }

  return opConfig;
};

const determineModel = async (prompt: string) => {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const tools: Tool[] = [
    {
      type: "function",
      name: "determine_model_type",
      description:
        "Determine which type of model would be most appropriate for the user's input",
      parameters: {
        type: "object",
        properties: {
          model: {
            type: "string",
            enum: ["regular", "thinking", "webSearch", "image"],
            description: "The type of model that should be used",
          },
        },
        required: ["model"],
        additionalProperties: false,
      },
      strict: true,
    },
  ];

  const response = await openai.responses.create({
    model: "gpt-4.1",
    input: [
      {
        role: "assistant",
        content:
          "Take the user prompt and determine which model would be most appropriate for the user's input using the determine_model_type function",
      },
      { role: "user", content: prompt },
    ],
    tools,
  });

  try {
    // this feels hacky as fuck but it works
    // wrapping in  atry/catch because that json parse is spooky
    // @ts-expect-error The OpenAI SDK types don't match our usage
    return JSON.parse(response?.output[0]?.arguments)?.model;
  } catch (error) {
    console.error(error);
    return "regular";
  }
};
