import { AIProvider, AIConfig, Message, PromptFacadeConfig } from "./types";

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

  private get currentConfig(): AIConfig {
    return this.config.providers[this.provider] as AIConfig;
  }

  setProvider(provider: AIProvider) {
    this.provider = provider;
  }

  async prompt(
    messages: Message[],
    model: string,
    options: { stream: boolean } = { stream: false }
  ) {
    try {
      const response = await fetch(this.currentConfig.url, {
        method: "POST",
        headers: this.currentConfig.headers,
        body: JSON.stringify({
          model,
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
