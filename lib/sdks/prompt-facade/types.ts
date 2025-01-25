export type AIProvider = "openai" | "xai" | "anthropic" | "deepseek" | string;

export interface AIConfig {
  url: string;
  headers: Record<string, string>;
}

export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface PromptFacadeConfig {
  providers: Record<AIProvider, AIConfig>;
  defaultProvider?: AIProvider;
}
