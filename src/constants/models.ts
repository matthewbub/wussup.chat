export const providers = ["openai", "xai", "google", "anthropic"] as const;
export const InputType = ["text", "images", "audio", "video"] as const;

export interface AiModel {
  provider: (typeof providers)[number];
  model: string;
  forchatuse: boolean;

  reasoning?: boolean;

  id: string;
  free: boolean;
  inputs?: string[];
  outputs?: string[];
  meta?: {
    optimized_for: string;
    token_limits?: {
      input: number;
      output: number;
    };
    capabilities?: {
      structured_outputs: boolean;
      caching: string;
      tuning: boolean;
      function_calling: boolean;
      code_execution: boolean;
      search: boolean;
      image_generation: string;
      native_tool_use: boolean;
      audio_generation: string;
      multimodal_live_api: string;
    };
    versions?: {
      latest: string;
      stable: string;
    };
    latest_update: string;
    knowledge_cutoff: string;
    billing?: {
      input: {
        text: number;
        image: number;
        video: number;
        audio: number;
      };
      output: number;
      context_caching: {
        price: {
          text_image_video: number;
          audio: number;
        };
        storage: number;
        available_date: string;
      };
      search: {
        included_requests: number;
        additional_cost: number;
      };
      tuning: string;
    };
  };
}

export const openAiModels: AiModel[] = [
  {
    provider: "openai",
    model: "gpt-4o",
    forchatuse: true,
    inputs: ["text", "images"],
    outputs: ["text"],
    id: "gpt-4o",
    free: false,
    meta: {
      optimized_for: "Fast, intelligent, flexible GPT model for versatile use across most tasks",
      token_limits: {
        input: 128000,
        output: 16384,
      },
      capabilities: {
        structured_outputs: true,
        caching: "supported",
        tuning: true,
        function_calling: true,
        code_execution: false,
        search: false,
        image_generation: "not_supported",
        native_tool_use: true,
        audio_generation: "not_supported",
        multimodal_live_api: "not_supported",
      },
      billing: {
        input: {
          text: 2.5,
          image: 2.5,
          video: 0,
          audio: 0,
        },
        output: 10.0,
        context_caching: {
          price: {
            text_image_video: 1.25,
            audio: 0,
          },
          storage: 0,
          available_date: "available",
        },
        search: {
          included_requests: 0,
          additional_cost: 0,
        },
        tuning: "supported",
      },
      versions: {
        latest: "gpt-4o",
        stable: "gpt-4o-2024-11-20",
      },
      latest_update: "2024-11",
      knowledge_cutoff: "2023-09",
    },
  },
  {
    provider: "openai",
    model: "gpt-4o-mini",
    inputs: ["text", "images"],
    outputs: ["text"],
    forchatuse: true,
    id: "gpt-4o-mini",
    free: true,
    meta: {
      optimized_for: "Fast, affordable small model for focused tasks",
      token_limits: {
        input: 128000,
        output: 16384,
      },
      capabilities: {
        structured_outputs: true,
        caching: "supported",
        tuning: true,
        function_calling: true,
        code_execution: false,
        search: false,
        image_generation: "not_supported",
        native_tool_use: true,
        audio_generation: "not_supported",
        multimodal_live_api: "not_supported",
      },
      billing: {
        input: {
          text: 0.15,
          image: 0.15,
          video: 0,
          audio: 0,
        },
        output: 0.6,
        context_caching: {
          price: {
            text_image_video: 0.075,
            audio: 0,
          },
          storage: 0,
          available_date: "available",
        },
        search: {
          included_requests: 0,
          additional_cost: 0,
        },
        tuning: "supported",
      },
      versions: {
        latest: "gpt-4o-mini",
        stable: "gpt-4o-mini-2024-07-18",
      },
      latest_update: "2024-07",
      knowledge_cutoff: "2023-09",
    },
  },
  {
    provider: "openai",
    model: "o1",
    inputs: ["text", "images"],
    outputs: ["text"],
    forchatuse: true,
    id: "o1",
    free: false,
    reasoning: true,
    meta: {
      optimized_for: "High-intelligence reasoning with internal chain of thought processing",
      token_limits: {
        input: 200000,
        output: 100000,
      },
      capabilities: {
        structured_outputs: true,
        caching: "supported",
        tuning: false,
        function_calling: true,
        code_execution: false,
        search: false,
        image_generation: "not_supported",
        native_tool_use: true,
        audio_generation: "not_supported",
        multimodal_live_api: "not_supported",
      },
      billing: {
        input: {
          text: 15.0,
          image: 15.0,
          video: 0,
          audio: 0,
        },
        output: 60.0,
        context_caching: {
          price: {
            text_image_video: 7.5,
            audio: 0,
          },
          storage: 0,
          available_date: "available",
        },
        search: {
          included_requests: 0,
          additional_cost: 0,
        },
        tuning: "not_available",
      },
      versions: {
        latest: "o1",
        stable: "o1-2024-12-17",
      },
      latest_update: "2024-12",
      knowledge_cutoff: "2023-09",
    },
  },
  {
    provider: "openai",
    model: "o3-mini",
    inputs: ["text"],
    outputs: ["text"],
    forchatuse: true,
    id: "o3-mini",
    free: false,
    reasoning: true,
    meta: {
      optimized_for: "High intelligence at cost-effective latency targets",
      token_limits: {
        input: 200000,
        output: 100000,
      },
      capabilities: {
        structured_outputs: true,
        caching: "supported",
        tuning: false,
        function_calling: true,
        code_execution: false,
        search: false,
        image_generation: "not_supported",
        native_tool_use: true,
        audio_generation: "not_supported",
        multimodal_live_api: "not_supported",
      },
      billing: {
        input: {
          text: 1.1,
          image: 0,
          video: 0,
          audio: 0,
        },
        output: 4.4,
        context_caching: {
          price: {
            text_image_video: 0.55,
            audio: 0,
          },
          storage: 0,
          available_date: "available",
        },
        search: {
          included_requests: 0,
          additional_cost: 0,
        },
        tuning: "not_available",
      },
      versions: {
        latest: "o3-mini",
        stable: "o3-mini-2025-01-31",
      },
      latest_update: "2025-01",
      knowledge_cutoff: "2023-09",
    },
  },
  {
    provider: "openai",
    model: "gpt-4.5-preview",
    inputs: ["text", "images"],
    outputs: ["text"],
    id: "gpt-4.5-preview",
    forchatuse: true,
    free: false,
    meta: {
      optimized_for:
        "Largest and most capable GPT model with deep world knowledge and better understanding of user intent",
      token_limits: {
        input: 128000,
        output: 16384,
      },
      capabilities: {
        structured_outputs: true,
        caching: "supported",
        tuning: false,
        function_calling: true,
        code_execution: false,
        search: false,
        image_generation: "not_supported",
        native_tool_use: true,
        audio_generation: "not_supported",
        multimodal_live_api: "not_supported",
      },
      billing: {
        input: {
          text: 75.0,
          image: 75.0,
          video: 0,
          audio: 0,
        },
        output: 150.0,
        context_caching: {
          price: {
            text_image_video: 37.5,
            audio: 0,
          },
          storage: 0,
          available_date: "available",
        },
        search: {
          included_requests: 0,
          additional_cost: 0,
        },
        tuning: "not_available",
      },
      versions: {
        latest: "gpt-4.5-preview",
        stable: "gpt-4.5-preview-2025-02-27",
      },
      latest_update: "2025-02",
      knowledge_cutoff: "2023-09",
    },
  },
];

export const anthropicModels: AiModel[] = [
  {
    provider: "anthropic",
    model: "claude-3-7-sonnet-20250219",
    inputs: ["text", "images"],
    outputs: ["text"],
    id: "claude-3-7-sonnet",
    free: false,
    forchatuse: true,
    meta: {
      optimized_for: "Highest level of intelligence and capability with toggleable extended thinking",
      token_limits: {
        input: 200000,
        output: 8192, // 64000 with extended thinking
      },
      capabilities: {
        structured_outputs: true,
        caching: "not_supported",
        tuning: false,
        function_calling: true,
        code_execution: true,
        search: false,
        image_generation: "not_supported",
        native_tool_use: true,
        audio_generation: "not_supported",
        multimodal_live_api: "supported",
      },
      billing: {
        input: {
          text: 3.0,
          image: 3.0,
          video: 0,
          audio: 0,
        },
        output: 15.0,
        context_caching: {
          price: {
            text_image_video: 0,
            audio: 0,
          },
          storage: 0,
          available_date: "not_available",
        },
        search: {
          included_requests: 0,
          additional_cost: 0,
        },
        tuning: "not_available",
      },
      versions: {
        latest: "claude-3-7-sonnet-latest",
        stable: "claude-3-7-sonnet-20250219",
      },
      latest_update: "2025-02",
      knowledge_cutoff: "2024-10",
    },
  },
  {
    provider: "anthropic",
    model: "claude-3-5-sonnet-20241022",
    inputs: ["text", "images"],
    outputs: ["text"],
    id: "claude-3-5-sonnet",
    free: false,
    forchatuse: true,
    meta: {
      optimized_for: "High level of intelligence and capability",
      token_limits: {
        input: 200000,
        output: 8192,
      },
      capabilities: {
        structured_outputs: true,
        caching: "not_supported",
        tuning: false,
        function_calling: true,
        code_execution: true,
        search: false,
        image_generation: "not_supported",
        native_tool_use: true,
        audio_generation: "not_supported",
        multimodal_live_api: "supported",
      },
      billing: {
        input: {
          text: 3.0,
          image: 3.0,
          video: 0,
          audio: 0,
        },
        output: 15.0,
        context_caching: {
          price: {
            text_image_video: 0,
            audio: 0,
          },
          storage: 0,
          available_date: "not_available",
        },
        search: {
          included_requests: 0,
          additional_cost: 0,
        },
        tuning: "not_available",
      },
      versions: {
        latest: "claude-3-5-sonnet-latest",
        stable: "claude-3-5-sonnet-20241022",
      },
      latest_update: "2024-10",
      knowledge_cutoff: "2024-04",
    },
  },
  {
    provider: "anthropic",
    model: "claude-3-5-haiku-20241022",
    inputs: ["text", "images"],
    outputs: ["text"],
    id: "claude-3-5-haiku",
    free: false,
    forchatuse: true,
    meta: {
      optimized_for: "Intelligence at blazing speeds",
      token_limits: {
        input: 200000,
        output: 8192,
      },
      capabilities: {
        structured_outputs: true,
        caching: "not_supported",
        tuning: false,
        function_calling: true,
        code_execution: true,
        search: false,
        image_generation: "not_supported",
        native_tool_use: true,
        audio_generation: "not_supported",
        multimodal_live_api: "supported",
      },
      billing: {
        input: {
          text: 0.8,
          image: 0.8,
          video: 0,
          audio: 0,
        },
        output: 4.0,
        context_caching: {
          price: {
            text_image_video: 0,
            audio: 0,
          },
          storage: 0,
          available_date: "not_available",
        },
        search: {
          included_requests: 0,
          additional_cost: 0,
        },
        tuning: "not_available",
      },
      versions: {
        latest: "claude-3-5-haiku-latest",
        stable: "claude-3-5-haiku-20241022",
      },
      latest_update: "2024-10",
      knowledge_cutoff: "2024-07",
    },
  },
];

export const xaiModels: AiModel[] = [
  {
    provider: "xai",
    model: "grok-2-1212",
    inputs: ["text"],
    outputs: ["text"],
    id: "grok-2",
    free: false,
    forchatuse: true,
    meta: {
      optimized_for: "Advanced text processing and generation",
      token_limits: {
        input: 131072,
        output: 131072,
      },
      capabilities: {
        structured_outputs: true,
        caching: "not_supported",
        tuning: false,
        function_calling: true,
        code_execution: false,
        search: false,
        image_generation: "not_supported",
        native_tool_use: true,
        audio_generation: "not_supported",
        multimodal_live_api: "not_supported",
      },
      billing: {
        input: {
          text: 2.0,
          image: 0,
          video: 0,
          audio: 0,
        },
        output: 10.0,
        context_caching: {
          price: {
            text_image_video: 0,
            audio: 0,
          },
          storage: 0,
          available_date: "not_available",
        },
        search: {
          included_requests: 0,
          additional_cost: 0,
        },
        tuning: "not_available",
      },
      versions: {
        latest: "grok-2",
        stable: "grok-2-1212",
      },
      latest_update: "2024-12",
      knowledge_cutoff: "2024-12",
    },
  },
  {
    provider: "xai",
    model: "grok-2-vision-1212",
    inputs: ["text", "images"],
    outputs: ["text"],
    id: "grok-2-vision",
    free: false,
    forchatuse: false,
    meta: {
      optimized_for: "Multimodal processing with vision capabilities",
      token_limits: {
        input: 32768,
        output: 32768,
      },
      capabilities: {
        structured_outputs: true,
        caching: "not_supported",
        tuning: false,
        function_calling: true,
        code_execution: false,
        search: false,
        image_generation: "not_supported",
        native_tool_use: true,
        audio_generation: "not_supported",
        multimodal_live_api: "not_supported",
      },
      billing: {
        input: {
          text: 2.0,
          image: 2.0,
          video: 0,
          audio: 0,
        },
        output: 10.0,
        context_caching: {
          price: {
            text_image_video: 0,
            audio: 0,
          },
          storage: 0,
          available_date: "not_available",
        },
        search: {
          included_requests: 0,
          additional_cost: 0,
        },
        tuning: "not_available",
      },
      versions: {
        latest: "grok-2-vision",
        stable: "grok-2-vision-1212",
      },
      latest_update: "2024-12",
      knowledge_cutoff: "2024-12",
    },
  },
  {
    provider: "xai",
    model: "grok-beta",
    inputs: ["text"],
    outputs: ["text"],
    id: "grok-beta",
    free: false,
    forchatuse: true,
    meta: {
      optimized_for: "Beta version of the Grok language model",
      token_limits: {
        input: 131072,
        output: 131072,
      },
      capabilities: {
        structured_outputs: true,
        caching: "not_supported",
        tuning: false,
        function_calling: true,
        code_execution: false,
        search: false,
        image_generation: "not_supported",
        native_tool_use: true,
        audio_generation: "not_supported",
        multimodal_live_api: "not_supported",
      },
      billing: {
        input: {
          text: 5.0,
          image: 0,
          video: 0,
          audio: 0,
        },
        output: 15.0,
        context_caching: {
          price: {
            text_image_video: 0,
            audio: 0,
          },
          storage: 0,
          available_date: "not_available",
        },
        search: {
          included_requests: 0,
          additional_cost: 0,
        },
        tuning: "not_available",
      },
      versions: {
        latest: "grok-beta",
        stable: "grok-beta",
      },
      latest_update: "2024-12",
      knowledge_cutoff: "2024-12",
    },
  },
  {
    provider: "xai",
    model: "grok-vision-beta",
    inputs: ["text", "images"],
    outputs: ["text"],
    id: "grok-vision-beta",
    free: false,
    forchatuse: false,
    meta: {
      optimized_for: "Beta version of the Grok vision model",
      token_limits: {
        input: 8192,
        output: 8192,
      },
      capabilities: {
        structured_outputs: true,
        caching: "not_supported",
        tuning: false,
        function_calling: true,
        code_execution: false,
        search: false,
        image_generation: "not_supported",
        native_tool_use: true,
        audio_generation: "not_supported",
        multimodal_live_api: "not_supported",
      },
      billing: {
        input: {
          text: 5.0,
          image: 5.0,
          video: 0,
          audio: 0,
        },
        output: 15.0,
        context_caching: {
          price: {
            text_image_video: 0,
            audio: 0,
          },
          storage: 0,
          available_date: "not_available",
        },
        search: {
          included_requests: 0,
          additional_cost: 0,
        },
        tuning: "not_available",
      },
      versions: {
        latest: "grok-vision-beta",
        stable: "grok-vision-beta",
      },
      latest_update: "2024-12",
      knowledge_cutoff: "2024-12",
    },
  },
];

export const geminiModels: AiModel[] = [
  {
    provider: "google",
    model: "gemini-2.0-flash",
    inputs: ["audio", "images", "videos", "text"],
    outputs: ["text", "images (coming soon)", "audio (coming soon)"],
    id: "gemini-2.0-flash",
    free: true,
    forchatuse: true,
    meta: {
      optimized_for: "Next generation features, speed, and multimodal generation for a diverse variety of tasks",
      token_limits: {
        input: 1048576,
        output: 8192,
      },
      capabilities: {
        structured_outputs: true,
        caching: "coming_soon",
        tuning: false,
        function_calling: true,
        code_execution: true,
        search: true,
        image_generation: "coming_soon",
        native_tool_use: true,
        audio_generation: "coming_soon",
        multimodal_live_api: "coming_soon",
      },
      billing: {
        input: {
          text: 0.1, // per 1M tokens
          image: 0.1, // per 1M tokens
          video: 0.1, // per 1M tokens
          audio: 0.7, // per 1M tokens
        },
        output: 0.4, // per 1M tokens
        context_caching: {
          price: {
            text_image_video: 0.025, // per 1M tokens
            audio: 0.175, // per 1M tokens
          },
          storage: 1.0, // per 1M tokens per hour
          available_date: "2025-03-31",
        },
        search: {
          included_requests: 1500, // free RPD
          additional_cost: 0.035, // per request after free tier
        },
        tuning: "not_available",
      },
      versions: {
        latest: "gemini-2.0-flash",
        stable: "gemini-2.0-flash-001",
      },
      latest_update: "2025-02",
      knowledge_cutoff: "2024-08",
    },
  },

  {
    provider: "google",
    model: "gemini-2.0-flash-lite",
    inputs: ["audio", "images", "videos", "text"],
    outputs: ["text"],
    id: "gemini-2.0-flash-lite",
    free: true,
    forchatuse: true,
    meta: {
      optimized_for: "Cost efficiency and low latency",
      token_limits: {
        input: 1048576, // per request
        output: 8192, // per request
      },
      capabilities: {
        structured_outputs: true,
        caching: "not_supported",
        tuning: false,
        function_calling: false,
        code_execution: false,
        search: false,
        image_generation: "not_supported",
        native_tool_use: false,
        audio_generation: "not_supported",
        multimodal_live_api: "not_supported",
      },
      billing: {
        input: {
          text: 0.075, // per 1M tokens
          image: 0.075, // per 1M tokens
          video: 0.075, // per 1M tokens
          audio: 0.075, // per 1M tokens
        },
        output: 0.3, // per 1M tokens
        context_caching: {
          price: {
            text_image_video: 0, // per 1M tokens
            audio: 0, // per 1M tokens
          },
          storage: 0, // per 1M tokens per hour
          available_date: "2025-03-31",
        },
        search: {
          included_requests: 0, // free RPD
          additional_cost: 0, // per request after free tier
        },
        tuning: "not_available",
      },
      versions: {
        latest: "gemini-2.0-flash-lite",
        stable: "gemini-2.0-flash-lite-001",
      },
      latest_update: "2025-02",
      knowledge_cutoff: "2024-08",
    },
  },
];

export const AVAILABLE_MODELS: AiModel[] = [...openAiModels, ...anthropicModels, ...xaiModels, ...geminiModels];
