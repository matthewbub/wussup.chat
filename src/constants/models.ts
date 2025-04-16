export const providers = ["openai", "xai", "google", "anthropic"] as const;
export const InputType = ["text", "images", "audio", "video"] as const;

export interface AiModel {
  // provider of the model
  provider: (typeof providers)[number];

  // do we want to show this model in the free/pro plans? or is this byok only?
  byokOnly: boolean;

  // displayed to the user
  displayName?: string;

  // does the model support reasoning?
  reasoning?: boolean;

  // 1:1 mapping of the model id
  id: string;

  // this is for the free tier
  free: boolean;

  // inputs supported by the model
  inputs?: string[];

  // outputs supported by the model
  outputs?: string[];

  // context window of the model
  contextWindow?: number;

  // description of the model
  description?: string;

  // input price of the model per million tokens
  inputPrice?: string;

  // output price of the model per million tokens
  outputPrice?: string;
}

export const openAiModels: AiModel[] = [
  {
    displayName: "GPT-4o",
    provider: "openai",
    byokOnly: false,
    inputs: ["text", "images"],
    outputs: ["text"],
    id: "gpt-4o",
    free: false,
  },
  {
    displayName: "GPT-4o Mini",
    provider: "openai",
    inputs: ["text", "images"],
    outputs: ["text"],
    byokOnly: false,
    id: "gpt-4o-mini",
    free: true,
  },
  {
    displayName: "o1",
    provider: "openai",
    inputs: ["text", "images"],
    outputs: ["text"],
    byokOnly: false,
    id: "o1",
    free: false,
    reasoning: true,
  },
  {
    displayName: "o3-mini",
    provider: "openai",
    inputs: ["text"],
    outputs: ["text"],
    byokOnly: false,
    id: "o3-mini",
    free: false,
    reasoning: true,
  },
  {
    displayName: "GPT-4.5",
    provider: "openai",
    inputs: ["text", "images"],
    outputs: ["text"],
    id: "gpt-4.5-preview",
    byokOnly: true,
    free: false,
  },
];

export const anthropicModels: AiModel[] = [
  {
    displayName: "Claude 3.7 Sonnet",
    provider: "anthropic",
    inputs: ["text", "images"],
    outputs: ["text"],
    id: "claude-3-7-sonnet",
    free: false,
    byokOnly: false,
  },
  {
    displayName: "Claude 3.5 Sonnet",
    provider: "anthropic",
    inputs: ["text", "images"],
    outputs: ["text"],
    id: "claude-3-5-sonnet",
    free: false,
    byokOnly: false,
  },
  {
    displayName: "Claude 3.5 Haiku",
    provider: "anthropic",
    inputs: ["text", "images"],
    outputs: ["text"],
    id: "claude-3-5-haiku",
    free: false,
    byokOnly: true,
  },
];

export const xaiModels: AiModel[] = [
  {
    displayName: "Grok 3",
    provider: "xai",
    inputs: ["text"],
    outputs: ["text"],
    id: "grok-3-beta",
    free: false,
    byokOnly: false,
    contextWindow: 131072,
    description:
      "Our flagship model that excels at enterprise tasks like data extraction, programming, and text summarization.",
    inputPrice: "$3.00",
    outputPrice: "$15.00",
  },
  {
    displayName: "Grok 3 Mini",
    provider: "xai",
    inputs: ["text"],
    outputs: ["text"],
    id: "grok-3-mini-beta",
    free: true,
    byokOnly: false,
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
    id: "gemini-2.5-pro-exp-03-25",
    free: false,
    byokOnly: false,
  },
  {
    displayName: "Gemini 2.0 Flash",
    provider: "google",
    inputs: ["audio", "images", "videos", "text"],
    outputs: ["text", "images (coming soon)", "audio (coming soon)"],
    id: "gemini-2.0-flash",
    free: true,
    byokOnly: false,
  },
  {
    displayName: "Gemini 2.0 Flash Lite",
    provider: "google",
    inputs: ["audio", "images", "videos", "text"],
    outputs: ["text"],
    id: "gemini-2.0-flash-lite",
    free: false,
    byokOnly: false,
  },
];

export const AVAILABLE_MODELS: AiModel[] = [...openAiModels, ...anthropicModels, ...xaiModels, ...geminiModels].filter(
  (model) => model.byokOnly === false
);
