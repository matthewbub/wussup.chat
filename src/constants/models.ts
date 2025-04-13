export const providers = ["openai", "xai", "google", "anthropic"] as const;
export const InputType = ["text", "images", "audio", "video"] as const;

export interface AiModel {
  provider: (typeof providers)[number];
  model: string;
  forchatuse: boolean;
  displayName?: string;
  reasoning?: boolean;
  id: string;
  free: boolean;
  inputs?: string[];
  outputs?: string[];
  contextWindow?: number;
  description?: string;
  inputPrice?: string;
  outputPrice?: string;
}

export const openAiModels: AiModel[] = [
  {
    displayName: "GPT-4o",
    provider: "openai",
    model: "gpt-4o",
    forchatuse: true,
    inputs: ["text", "images"],
    outputs: ["text"],
    id: "gpt-4o",
    free: false,
  },
  {
    displayName: "GPT-4o Mini",
    provider: "openai",
    model: "gpt-4o-mini",
    inputs: ["text", "images"],
    outputs: ["text"],
    forchatuse: true,
    id: "gpt-4o-mini",
    free: true,
  },
  {
    displayName: "o1",
    provider: "openai",
    model: "o1",
    inputs: ["text", "images"],
    outputs: ["text"],
    forchatuse: true,
    id: "o1",
    free: false,
    reasoning: true,
  },
  {
    displayName: "o3-mini",
    provider: "openai",
    model: "o3-mini",
    inputs: ["text"],
    outputs: ["text"],
    forchatuse: true,
    id: "o3-mini",
    free: false,
    reasoning: true,
  },
  {
    displayName: "GPT-4.5",
    provider: "openai",
    model: "gpt-4.5-preview",
    inputs: ["text", "images"],
    outputs: ["text"],
    id: "gpt-4.5-preview",
    forchatuse: false,
    free: false,
  },
];

export const anthropicModels: AiModel[] = [
  {
    displayName: "Claude 3.7 Sonnet",
    provider: "anthropic",
    model: "claude-3-7-sonnet-20250219",
    inputs: ["text", "images"],
    outputs: ["text"],
    id: "claude-3-7-sonnet",
    free: false,
    forchatuse: true,
  },
  {
    displayName: "Claude 3.5 Sonnet",
    provider: "anthropic",
    model: "claude-3-5-sonnet-20241022",
    inputs: ["text", "images"],
    outputs: ["text"],
    id: "claude-3-5-sonnet",
    free: false,
    forchatuse: true,
  },
  {
    displayName: "Claude 3.5 Haiku",
    provider: "anthropic",
    model: "claude-3-5-haiku-20241022",
    inputs: ["text", "images"],
    outputs: ["text"],
    id: "claude-3-5-haiku",
    free: false,
    forchatuse: false,
  },
];

export const xaiModels: AiModel[] = [
  {
    displayName: "Grok 3",
    provider: "xai",
    model: "grok-3-beta",
    inputs: ["text"],
    outputs: ["text"],
    id: "grok-3-beta",
    free: false,
    forchatuse: true,
    contextWindow: 131072,
    description:
      "Our flagship model that excels at enterprise tasks like data extraction, programming, and text summarization.",
    inputPrice: "$3.00",
    outputPrice: "$15.00",
  },
  {
    displayName: "Grok 3 Mini",
    provider: "xai",
    model: "grok-3-mini-beta",
    inputs: ["text"],
    outputs: ["text"],
    id: "grok-3-mini-beta",
    free: true,
    forchatuse: true,
    contextWindow: 131072,
    description:
      "A lightweight model that thinks before responding. Excels at quantitative tasks that involve math and reasoning.",
    inputPrice: "$0.30",
    outputPrice: "$0.50",
  },
];

export const geminiModels: AiModel[] = [
  {
    displayName: "Gemini 2.5 Pro",
    provider: "google",
    model: "gemini-2.5-pro-exp-03-25",
    id: "gemini-2.5-pro-exp-03-25",
    free: false,
    forchatuse: true,
  },
  {
    displayName: "Gemini 2.0 Flash",
    provider: "google",
    model: "gemini-2.0-flash",
    inputs: ["audio", "images", "videos", "text"],
    outputs: ["text", "images (coming soon)", "audio (coming soon)"],
    id: "gemini-2.0-flash",
    free: true,
    forchatuse: true,
  },
  {
    displayName: "Gemini 2.0 Flash Lite",
    provider: "google",
    model: "gemini-2.0-flash-lite",
    inputs: ["audio", "images", "videos", "text"],
    outputs: ["text"],
    id: "gemini-2.0-flash-lite",
    free: false,
    forchatuse: false,
  },
];

export const AVAILABLE_MODELS: AiModel[] = [...openAiModels, ...anthropicModels, ...xaiModels, ...geminiModels].filter(
  (model) => model.forchatuse
);
