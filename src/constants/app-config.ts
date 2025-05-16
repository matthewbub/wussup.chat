export const appConfig = {
  name: "Wussup Chat",
  version: "1",
  description: "Wussup Chat",
  openai: {
    // this is gonna be more dynamic but for now this is fine
    webModel: "gpt-4.1",
    thinkingModel: "o4-mini",
    imageModel: "gpt-image-1",
    chatTitle: "gpt-4.1",
  },
  rules: {
    maxDailyMessagesOnFreePlan: 10,
    maxDailyMessagesOnProPlan: 500,
    lifetimeMessageCount: 0,
  },
  plans: {
    pro: "pro",
  },
};

export const streamHeaders = {
  headers: {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  },
};
