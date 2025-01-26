import { PromptFacade } from "@ninembs-studio/prompt-facade";

export const promptFacade = new PromptFacade({
  providers: {
    openai: {
      url: "https://api.openai.com/v1/chat/completions",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
    },
    xai: {
      url: "https://api.x.ai/v1/chat/completions",
      headers: {
        Authorization: `Bearer ${process.env.GROK_API_KEY}`,
        "Content-Type": "application/json",
      },
    },
    deepseek: {
      url: "https://api.deepseek.com/chat/completions",
      headers: {
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        "Content-Type": "application/json",
      },
    },
    anthropic: {
      url: "https://api.anthropic.com/v1/messages",
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY as string,
        "anthropic-version": "2023-06-01",
      },
    },
  },
  defaultProvider: "openai",
});
