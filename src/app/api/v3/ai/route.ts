import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { xai } from "@ai-sdk/xai";
import { LanguageModelV1, streamText } from "ai";
import { NextResponse } from "next/server";
import { AVAILABLE_MODELS } from "@/constants/models";
import { auth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";
export const maxDuration = 30;

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const content = formData.get("content") as string;
  const model = formData.get("model") as string;
  const model_provider = formData.get("model_provider") as string;
  const chat_context = formData.get("chat_context") as string;
  const messageHistory = formData.get("messageHistory") as string;

  // Validate model and provider
  const selectedModel = AVAILABLE_MODELS.find((m) => m.id === model && m.provider === model_provider);
  if (!selectedModel) {
    return NextResponse.json({ error: "Invalid model or provider combination" }, { status: 400 });
  }

  // Parse message history
  const parsedHistory = messageHistory ? JSON.parse(messageHistory) : [];

  // Create final messages array
  const messages = [
    ...parsedHistory.map((msg: { is_user: boolean; content: string }) => ({
      role: msg.is_user ? ("user" as const) : ("assistant" as const),
      content: msg.content,
    })),
    { role: "user" as const, content },
  ];

  try {
    // Select the appropriate provider based on model_provider
    const modelOpts = {
      openai: openai(selectedModel.model),
      anthropic: anthropic(selectedModel.model),
      google: google(selectedModel.model),
      xai: xai(selectedModel.model),
    };
    const provider = modelOpts[model_provider as keyof typeof modelOpts];

    if (!provider) {
      return NextResponse.json({ error: "Unsupported provider" }, { status: 400 });
    }

    const result = streamText({
      model: provider as LanguageModelV1,
      system: chat_context as string,
      messages,
    });

    return result.toDataStreamResponse({
      getErrorMessage: errorHandler,
      sendUsage: true,
    });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "Failed to generate response" }, { status: 500 });
  }
}

function errorHandler(error: unknown) {
  Sentry.captureException(error);
  return JSON.stringify(error);
}
