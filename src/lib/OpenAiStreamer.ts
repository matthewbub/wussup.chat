import {
  OpenAIConfig,
  OpenAiMessagePart,
  OpenAiImageResponse,
} from "@/app/types";
import { appConfig } from "@/constants/app-config";
import { put } from "@vercel/blob";
import OpenAI from "openai";
import { Tool } from "openai/resources/responses/responses.mjs";

/**
 * A utility class for handling OpenAI API configurations and responses.
 * This class provides methods to determine the appropriate model type,
 * build OpenAI API configurations, and create streaming responses.
 * It supports various model types including regular chat, thinking, web search, and image generation.
 */
export class OpenAiStreamer {
  /** The OpenAI API configuration object containing model settings and parameters */
  public config: OpenAIConfig;

  /** Array of messages to be sent to the OpenAI API */
  public messages: OpenAiMessagePart[];

  /** The user's input prompt to be processed */
  public prompt: string;

  /** The determined type of model to be used (regular, thinking, webSearch, or image) */
  public modelType: string;

  /**
   * Creates a new OpenAiStreamer instance.
   * @param {Object} options - Configuration options for the streamer
   * @param {OpenAiMessagePart[]} options.messages - Array of messages to be processed
   * @param {string} options.prompt - The user's input prompt
   */
  constructor({
    messages,
    prompt,
  }: {
    messages: OpenAiMessagePart[];
    prompt: string;
  }) {
    this.prompt = prompt;
    this.messages = messages;

    this.config = {
      model: "",
      stream: true,
      input: [],
      user: "",
    };
    this.modelType = "";
  }

  /**
   * Determines the most appropriate model type based on the user's prompt.
   * Uses GPT-4 to analyze the prompt and select between regular, thinking, webSearch, or image models.
   * @returns {Promise<OpenAiStreamer>} The current instance for method chaining
   */
  public async determineModelType() {
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
        { role: "user", content: this.prompt },
      ],
      tools,
    });

    try {
      // this feels hacky as fuck but it works
      // wrapping in  atry/catch because that json parse is spooky
      // @ts-expect-error The OpenAI SDK types don't match our usage
      this.modelType = JSON.parse(response?.output[0]?.arguments)?.model;
    } catch (error) {
      console.error(error);
      this.modelType = "regular";
    }

    return this;
  }

  /**
   * Prepares the OpenAI configuration based on the determined model type.
   * Sets up appropriate model parameters, tools, and reasoning options.
   * @param {string} userId - The unique identifier for the user
   * @returns {Promise<OpenAiStreamer>} The current instance for method chaining
   */
  public async readyOpenAiConfig(userId: string) {
    const opConfig: OpenAIConfig = {
      model: appConfig.openai.thinkingModel,
      stream: true as const,
      input: this.messages,
      // https://platform.openai.com/docs/guides/safety-best-practices#end-user-ids
      user: userId,
    };

    if (this.modelType === "thinking") {
      opConfig.model = appConfig.openai.thinkingModel;
      opConfig.reasoning = {
        effort: "medium",
        summary: "auto",
      };
    }

    if (this.modelType === "webSearch") {
      opConfig.model = appConfig.openai.webModel;
      opConfig.tools = [{ type: "web_search_preview" }];
    }

    this.config = opConfig;
    return this;
  }

  /**
   * Returns the currently determined model type.
   * @returns {string} The model type (regular, thinking, webSearch, or image)
   */
  public getModelType() {
    return this.modelType;
  }

  /**
   * Creates a streaming response from the OpenAI API.
   * @param {string} [apiKey] - Optional API key to use for the request. Defaults to environment variable.
   * @returns {Promise<any>} The streaming response from OpenAI
   */
  public async createOpenAiStreamResponse(
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

  /**
   * Generates an image using OpenAI's image generation model and uploads it to Vercel Blob storage.
   * @param {string} [apiKey] - Optional API key to use for the request. Defaults to environment variable.
   * @param {string} userId - The unique identifier for the user
   * @param {string} prompt - The prompt to generate the image from
   * @returns {Promise<OpenAiImageResponse>} Object containing the generated image URLs and metadata
   * @throws {Error} If image generation fails
   */
  public async createOpenAiImageResponse(
    apiKey: string | undefined = process.env.OPENAI_API_KEY,
    userId: string,
    prompt: string
  ): Promise<OpenAiImageResponse> {
    // console.log("this.config", this.config);
    const openai = new OpenAI({
      apiKey: apiKey,
    });

    const result = await openai.images.generate({
      model: appConfig.openai.imageModel,
      prompt:
        "Heres the prompt: " +
        prompt +
        "\n\n Heres the message history for context: " +
        JSON.stringify(this.messages),
    });

    const image_base64 = result.data?.[0]?.b64_json;
    if (!image_base64) {
      throw new Error("Failed to generate image");
    }

    // Convert base64 to Buffer
    const image_bytes = Buffer.from(image_base64, "base64");

    // Generate a unique filename
    const timestamp = Date.now();
    const uniqueFilename = `generated-images/${userId}/${timestamp}.png`;

    // Upload to Vercel Blob
    const blob = await put(uniqueFilename, image_bytes, { access: "public" });

    return {
      url: blob.url,
      downloadUrl: blob.downloadUrl,
      pathname: blob.pathname,
      contentType: blob.contentType,
    };
  }
}
