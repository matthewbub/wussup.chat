export const appConfig = {
  name: "App name",
  version: "1",
  description: "App description",
  openai: {
    // this is gonna be more dynamic but for now this is fine
    webModel: "gpt-4.1",
    thinkingModel: "o4-mini",
    imageModel: "gpt-image-1",
    chatTitle: "gpt-4.1",
  },
};

export const streamHeaders = {
  headers: {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  },
};
