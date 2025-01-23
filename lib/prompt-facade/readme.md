# Prompt Facade

A TypeScript library that provides a facade pattern for interacting with various AI providers.

## Installation

```sh
npm install @ninembs-studio/prompt-facade
```

## Usage

```ts
import { PromptFacade } from "@ninembs-studio/prompt-facade";

// Configure the facade with your providers
const facade = new PromptFacade({
  providers: {
    "my-ai-provider": {
      url: "https://api.example.com/chat",
      headers: {
        Authorization: "Bearer your-api-key",
        "Content-Type": "application/json",
      },
    },
  },
  defaultProvider: "my-ai-provider",
});

// Use the facade
await facade.prompt("Hello, AI!", "model-name");

// Get conversation history
const history = facade.getHistory();
```

## Features

- Support for multiple AI providers
- Conversation history management
- Type-safe configuration
- Provider switching
- System message support
