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
  },
  defaultProvider: "openai",
});
