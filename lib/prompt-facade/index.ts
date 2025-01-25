import { AIProvider, Message, PromptFacadeConfig } from "./types";

export class PromptFacade {
  private config: PromptFacadeConfig;

  constructor(config: PromptFacadeConfig) {
    if (
      !config.providers ||
      Object.keys(config.providers).length === 0 ||
      !config.defaultProvider
    ) {
      throw new Error(
        "PromptFacade requires at least one provider configuration"
      );
    }

    this.config = config;
  }

  async prompt(
    messages: Message[],
    model: {
      name: string;
      provider: AIProvider;
    },
    options: { stream: boolean } = { stream: false }
  ) {
    try {
      const providerConfig = this.config.providers[model.provider];
      if (!providerConfig) {
        throw new Error(`Provider ${model.provider} not found`);
      }

      // Format request body based on provider
      let requestBody;
      if (model.provider === "openai") {
        requestBody = {
          model: model.name,
          messages: messages,
          stream: options.stream,
        };
      } else if (model.provider === "anthropic") {
        requestBody = {
          messages: messages,
          model: model.name,
          stream: options.stream,
        };
      } else {
        // Default format for other providers
        requestBody = {
          model: model.name,
          messages: messages,
          stream: options.stream,
        };
      }

      const response = await fetch(providerConfig.url, {
        method: "POST",
        headers: providerConfig.headers,
        body: JSON.stringify(requestBody),
      });

      return response;
    } catch (error) {
      console.error(`Error with ${model.provider} API:`, error);
      throw error;
    }
  }
}

export * from "./types";
