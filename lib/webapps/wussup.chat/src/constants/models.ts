export const chatModels = {
  openai: [
    {
      id: "gpt-4o-mini",
      name: "GPT 4o Mini",
      free: true,
    },
    {
      id: "chatgpt-4o-latest",
      name: "ChatGPT 4o Latest",
      free: false,
    },
    {
      id: "gpt-4o",
      name: "GPT 4o",
      free: false,
    },
    {
      id: "o1",
      name: "O1",
      free: false,
    },
    {
      id: "o1-mini",
      name: "O1 Mini",
      free: false,
    },
  ],
  anthropic: [
    {
      id: "claude-3-haiku-latest",
      name: "Claude 3 Haiku Latest",
      free: true,
    },
    {
      id: "claude-3-5-sonnet-20241022",
      name: "Claude 3.5 Sonnet 20241022",
      free: false,
    },
    {
      id: "claude-3-5-haiku-20241022",
      name: "Claude 3.5 Haiku 20241022",
      free: false,
    },
    {
      id: "claude-3-opus-20240229",
      name: "Claude 3 Opus 20240229",
      free: false,
    },
  ],
  xai: [
    {
      id: "grok-2-latest",
      name: "Groq",
      free: true,
    },
    {
      id: "grok-beta",
      name: "Groq Beta",
      free: true,
    },
  ],
  deepseek: [
    {
      id: "deepseek-chat",
      name: "DeepSeek Chat",
      free: false,
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
