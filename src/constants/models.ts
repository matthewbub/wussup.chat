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
  provider: "openai" | "anthropic" | "xai" | "google";
  model: string;
  image_input: boolean;
  object_generation: boolean;
  tool_usage: boolean;
  tool_streaming: boolean;
  id: string;
  name: string;
  free: boolean;
}

export const providers = ["openai", "xai", "gemini"] as const;

export const openAiModels: AiModel[] = [
  {
    provider: "openai",
    model: "gpt-4o",
    image_input: true,
    object_generation: true,
    tool_usage: true,
    tool_streaming: true,
    id: "gpt-4o",
    name: "GPT-4 Optimized",
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
    name: "GPT-4 Optimized Mini",
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
    name: "GPT-4 Turbo",
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
    name: "GPT-4",
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
    name: "O1",
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
    name: "O1 Mini",
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
    name: "O1 Preview",
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
    name: "Claude 3.7 Sonnet",
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
    name: "Claude 3.5 Sonnet",
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
    name: "Claude 3.5 Sonnet (June 2024)",
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
    name: "Claude 3.5 Haiku",
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
    name: "Grok 2",
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
    name: "Grok 2 Vision",
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
    name: "Grok Beta",
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
    name: "Grok Vision Beta",
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
    name: "Gemini 2.0 Flash",
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
    name: "Gemini 2.0 Flash Experimental",
    free: false,
  },
];

export const AVAILABLE_MODELS: AiModel[] = [...openAiModels, ...anthropicModels, ...xaiModels, ...geminiModels];
