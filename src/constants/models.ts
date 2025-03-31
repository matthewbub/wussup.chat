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
    displayName: "Grok 2",
    provider: "xai",
    model: "grok-2-1212",
    inputs: ["text"],
    outputs: ["text"],
    id: "grok-2",
    free: true,
    forchatuse: true,
  },
  {
    displayName: "Grok 2 Vision",
    provider: "xai",
    model: "grok-2-vision-1212",
    inputs: ["text", "images"],
    outputs: ["text"],
    id: "grok-2-vision",
    free: false,
    forchatuse: false,
  },
  {
    displayName: "Grok 2 Beta",
    provider: "xai",
    model: "grok-beta",
    inputs: ["text"],
    outputs: ["text"],
    id: "grok-beta",
    free: false,
    forchatuse: false,
  },
  {
    displayName: "Grok 2 Vision Beta",
    provider: "xai",
    model: "grok-vision-beta",
    inputs: ["text", "images"],
    outputs: ["text"],
    id: "grok-vision-beta",
    free: false,
    forchatuse: false,
  },
];

export const geminiModels: AiModel[] = [
  {
    displayName: "Gemini 2.5 Pro",
    provider: "google",
    model: "gemini-2.5-pro-exp-03-25",
    id: "gemini-2.5-pro-exp-03-25",
    free: false,
    forchatuse: false,
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
