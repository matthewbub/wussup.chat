export const chatModels = {
  openai: [
    // This isnt available to me yet
    // {
    //   id: "o3-mini",
    //   name: "O3 Mini",
    //   free: true,
    //   reasoning: true,
    // },
    {
      id: "gpt-4o-mini",
      name: "GPT 4o Mini",
      free: true,
      reasoning: false,
    },
    {
      id: "chatgpt-4o-latest",
      name: "ChatGPT 4o",
      free: true,
      reasoning: false,
    },
    {
      id: "o1",
      name: "O1",
      free: false,
      reasoning: true,
    },
    {
      id: "o1-mini",
      name: "O1 Mini",
      free: false,
      reasoning: true,
    },
  ],
  // anthropic: [
  //   {
  //     id: "claude-3-haiku-latest",
  //     name: "Claude 3 Haiku Latest",
  //     free: true,
  //     reasoning: true,
  //   },
  //   {
  //     id: "claude-3-5-sonnet-20241022",
  //     name: "Claude 3.5 Sonnet 20241022",
  //     free: false,
  //     reasoning: true,
  //   },
  //   {
  //     id: "claude-3-5-haiku-20241022",
  //     name: "Claude 3.5 Haiku 20241022",
  //     free: false,
  //     reasoning: true,
  //   },
  //   {
  //     id: "claude-3-opus-20240229",
  //     name: "Claude 3 Opus 20240229",
  //     free: false,
  //     reasoning: true,
  //   },
  // ],
  xai: [
    {
      id: "grok-2-latest",
      name: "Grok 2",
      free: true,
    },
    {
      id: "grok-beta",
      name: "Grok Beta",
      free: true,
    },
  ],
  gemini: [
    {
      id: "gemini-2.0-flash-lite-preview-02-05",
      name: "Gemini 2.0 Flash Lite",
      free: true,
    },
    {
      id: "gemini-2.0-flash-001",
      name: "Gemini 2.0 Flash",
      free: false,
    },
  ],
};

export interface AiModel {
  id: string;
  name: string;
  free: boolean;
  provider: "openai" | "xai" | "gemini";
}
export const providers = ["openai", "xai", "gemini"] as const;
export const AVAILABLE_MODELS: AiModel[] = providers.flatMap((provider) =>
  chatModels[provider].map((model) => ({
    ...model,
    provider: provider as AiModel["provider"],
  }))
);
