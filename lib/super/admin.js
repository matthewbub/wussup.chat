#!/usr/bin/env node

require("dotenv").config();
const inquirer = require("inquirer");
const fs = require("fs").promises;

// define the available admin tasks
const adminTasks = {
  listOpenAiModels: async () => {
    const response = await fetch("https://api.openai.com/v1/models", {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    });
    const data = await response.json();

    const models = data.data.map((model) => ({
      name: model.id,
      provider: "openai",
    }));

    console.table(models);
  },
  listAnthropicModels: async () => {
    const response = await fetch("https://api.anthropic.com/v1/models", {
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
    });
    const data = await response.json();
    console.table(data.data);
  },
  listGroqModels: async () => {
    const response = await fetch("https://api.x.ai/v1/models", {
      headers: {
        Authorization: `Bearer ${process.env.GROK_API_KEY}`,
      },
    });
    const data = await response.json();
    console.table(data.data);
  },
  listDeepSeekModels: async () => {
    const response = await fetch("https://api.deepseek.com/v1/models", {
      headers: {
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
    });
    const data = await response.json();
    console.table(data.data);
  },
  generateOpenAiTypes: async () => {
    const response = await fetch("https://api.openai.com/v1/models", {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    });
    const data = await response.json();
    const types = `export type OpenAIModel = "${data.data
      .map((model) => model.id)
      .join('" | "')}";\n`;
    await fs.writeFile("openai.d.ts", types);
    console.log("OpenAI types generated successfully!");
  },
  generateAnthropicTypes: async () => {
    const response = await fetch("https://api.anthropic.com/v1/models", {
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
    });
    const data = await response.json();
    const types = `export type AnthropicModel = "${data.data
      .map((model) => model.id)
      .join('" | "')}";\n`;
    await fs.writeFile("anthropic.d.ts", types);
    console.log("Anthropic types generated successfully!");
  },
  generateGroqTypes: async () => {
    const response = await fetch("https://api.x.ai/v1/models", {
      headers: {
        Authorization: `Bearer ${process.env.GROK_API_KEY}`,
      },
    });
    const data = await response.json();
    const types = `export type GroqModel = "${data.data
      .map((model) => model.id)
      .join('" | "')}";\n`;
    await fs.writeFile("groq.d.ts", types);
    console.log("Groq types generated successfully!");
  },
  generateDeepSeekTypes: async () => {
    const response = await fetch("https://api.deepseek.com/v1/models", {
      headers: {
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
    });
    const data = await response.json();
    const types = `export type DeepSeekModel = "${data.data
      .map((model) => model.id)
      .join('" | "')}";\n`;
    await fs.writeFile("deepseek.d.ts", types);
    console.log("DeepSeek types generated successfully!");
  },
};

// main menu function
async function showMainMenu() {
  while (true) {
    const { action } = await inquirer.prompt([
      {
        type: "list",
        name: "action",
        message: "Select an admin action:",
        choices: [
          "List OpenAI Models",
          "Generate OpenAI Types",
          "List Anthropic Models",
          "Generate Anthropic Types",
          "List Groq Models",
          "Generate Groq Types",
          "List DeepSeek Models",
          "Generate DeepSeek Types",
          "Exit",
        ],
      },
    ]);

    if (action === "Exit") {
      console.log("Goodbye!");
      process.exit(0);
    }

    switch (action) {
      case "List OpenAI Models":
        await adminTasks.listOpenAiModels();
        break;
      case "Generate OpenAI Types":
        await adminTasks.generateOpenAiTypes();
        break;
      case "List Anthropic Models":
        await adminTasks.listAnthropicModels();
        break;
      case "Generate Anthropic Types":
        await adminTasks.generateAnthropicTypes();
        break;
      case "List Groq Models":
        await adminTasks.listGroqModels();
        break;
      case "Generate Groq Types":
        await adminTasks.generateGroqTypes();
        break;
      case "List DeepSeek Models":
        await adminTasks.listDeepSeekModels();
        break;
      case "Generate DeepSeek Types":
        await adminTasks.generateDeepSeekTypes();
        break;
    }
  }
}

// start the cli
showMainMenu().catch(console.error);
