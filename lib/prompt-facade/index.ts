import { AIProvider, Message, PromptFacadeConfig } from "./types";

export class PromptFacade {
  private provider: AIProvider;
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
    this.provider = config.defaultProvider ?? Object.keys(config.providers)[0];
  }

  setProvider(provider: AIProvider) {
    this.provider = provider;
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
      const response = await fetch(providerConfig.url, {
        method: "POST",
        headers: providerConfig.headers,
        body: JSON.stringify({
          model: model.name,
          messages: messages,
          stream: options.stream,
        }),
      });

      return response;
    } catch (error) {
      console.error(`Error with ${this.provider} API:`, error);
      throw error;
    }
  }
}

export * from "./types";
