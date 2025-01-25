export const chatModels = {
  openai: [
    {
      id: "gpt-4o-mini",
      name: "GPT 4o Mini",
    },
    {
      id: "chatgpt-4o-latest",
      name: "ChatGPT 4o Latest",
    },
    {
      id: "gpt-4o",
      name: "GPT 4o",
    },
    {
      id: "o1",
      name: "O1",
    },
    {
      id: "o1-mini",
      name: "O1 Mini",
    },
  ],
  anthropic: [
    {
      id: "claude-3-5-sonnet-20241022",
      name: "Claude 3.5 Sonnet 20241022",
    },
    {
      id: "claude-3-5-haiku-20241022",
      name: "Claude 3.5 Haiku 20241022",
    },
    {
      id: "claude-3-opus-20240229",
      name: "Claude 3 Opus 20240229",
    },
  ],
  xai: [
    {
      id: "grok-2-1212",
      name: "Groq 2.1212",
    },
    {
      id: "grok-beta",
      name: "Groq Beta",
    },
  ],
  deepseek: [
    {
      id: "deepseek-chat",
      name: "DeepSeek Chat",
    },
    {
      id: "deepseek-reasoner",
      name: "DeepSeek Reasoner",
    },
  ],
};
export interface AiModel {
  id: string;
  name: string;
  provider: "openai" | "anthropic" | "xai" | "deepseek";
}
export const providers = ["openai", "anthropic", "xai", "deepseek"] as const;
export const AVAILABLE_MODELS: AiModel[] = providers.flatMap((provider) =>
  chatModels[provider].map((model) => ({
    ...model,
    provider: provider as AiModel["provider"],
  }))
);
