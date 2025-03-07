export const providers = ["openai", "xai", "google", "anthropic"] as const;

export interface AiModel {
  provider: (typeof providers)[number];
  model: string;
  image_input: boolean;
  object_generation: boolean;
  tool_usage: boolean;
  tool_streaming: boolean;
  id: string;
  free: boolean;
}

export const openAiModels: AiModel[] = [
  {
    provider: "openai",
    model: "gpt-4o",
    image_input: true,
    object_generation: true,
    tool_usage: true,
    tool_streaming: true,
    id: "gpt-4o",
    free: false,
  },
  {
    provider: "openai",
    model: "gpt-4o-mini",
    image_input: true,
    object_generation: true,
    tool_usage: true,
    tool_streaming: true,
    id: "gpt-4o-mini",
    free: true,
  },
  {
    provider: "openai",
    model: "gpt-4-turbo",
    image_input: true,
    object_generation: true,
    tool_usage: true,
    tool_streaming: true,
    id: "gpt-4-turbo",
    free: false,
  },
  {
    provider: "openai",
    model: "gpt-4",
    image_input: false,
    object_generation: true,
    tool_usage: true,
    tool_streaming: true,
    id: "gpt-4",
    free: false,
  },
  {
    provider: "openai",
    model: "o1",
    image_input: true,
    object_generation: false,
    tool_usage: true,
    tool_streaming: true,
    id: "o1",
    free: true,
  },
  {
    provider: "openai",
    model: "o1-mini",
    image_input: true,
    object_generation: false,
    tool_usage: true,
    tool_streaming: true,
    id: "o1-mini",
    free: true,
  },
  {
    provider: "openai",
    model: "o1-preview",
    image_input: false,
    object_generation: false,
    tool_usage: false,
    tool_streaming: false,
    id: "o1-preview",
    free: true,
  },
];

export const anthropicModels: AiModel[] = [
  {
    provider: "anthropic",
    model: "claude-3-7-sonnet-20250219",
    image_input: true,
    object_generation: true,
    tool_usage: true,
    tool_streaming: true,
    id: "claude-3-7-sonnet",
    free: false,
  },
  {
    provider: "anthropic",
    model: "claude-3-5-sonnet-20241022",
    image_input: true,
    object_generation: true,
    tool_usage: true,
    tool_streaming: true,
    id: "claude-3-5-sonnet",
    free: false,
  },
  {
    provider: "anthropic",
    model: "claude-3-5-sonnet-20240620",
    image_input: true,
    object_generation: true,
    tool_usage: true,
    tool_streaming: true,
    id: "claude-3-5-sonnet-20240620",
    free: false,
  },
  {
    provider: "anthropic",
    model: "claude-3-5-haiku-20241022",
    image_input: false,
    object_generation: true,
    tool_usage: true,
    tool_streaming: true,
    id: "claude-3-5-haiku",
    free: false,
  },
];

export const xaiModels: AiModel[] = [
  {
    provider: "xai",
    model: "grok-2-1212",
    image_input: false,
    object_generation: false,
    tool_usage: false,
    tool_streaming: false,
    id: "grok-2",
    free: false,
  },
  {
    provider: "xai",
    model: "grok-2-vision-1212",
    image_input: true,
    object_generation: false,
    tool_usage: false,
    tool_streaming: false,
    id: "grok-2-vision",
    free: false,
  },
  {
    provider: "xai",
    model: "grok-beta",
    image_input: false,
    object_generation: false,
    tool_usage: false,
    tool_streaming: false,
    id: "grok-beta",
    free: false,
  },
  {
    provider: "xai",
    model: "grok-vision-beta",
    image_input: true,
    object_generation: false,
    tool_usage: false,
    tool_streaming: false,
    id: "grok-vision-beta",
    free: false,
  },
];

export const geminiModels: AiModel[] = [
  {
    provider: "google",
    model: "gemini-2.0-flash-exp",
    image_input: true,
    object_generation: true,
    tool_usage: true,
    tool_streaming: true,
    id: "gemini-2.0-flash",
    free: false,
  },
  {
    provider: "google",
    model: "gemini-2.0-flash-exp",
    image_input: true,
    object_generation: true,
    tool_usage: true,
    tool_streaming: true,
    id: "gemini-2.0-flash-exp",
    free: false,
  },
];

export const AVAILABLE_MODELS: AiModel[] = [...openAiModels, ...anthropicModels, ...xaiModels, ...geminiModels];
