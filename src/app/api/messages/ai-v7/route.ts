import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { xai } from "@ai-sdk/xai";
import { LanguageModelV1, streamText } from "ai";
import { NextResponse } from "next/server";
import { AVAILABLE_MODELS } from "@/constants/models";
import * as Sentry from "@sentry/nextjs";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messages, model, sessionId } = await req.json();

    const selectedModel = AVAILABLE_MODELS.find((m) => m.id === model);
    if (!selectedModel) {
      return NextResponse.json({ error: "Invalid model or provider combination" }, { status: 400 });
    }

    const modelOpts = {
      openai: openai(selectedModel.id),
      anthropic: anthropic(selectedModel.id),
      google: google(selectedModel.id),
      xai: xai(selectedModel.id),
    };
    const provider = modelOpts[selectedModel.provider as keyof typeof modelOpts];
    if (!provider) {
      return NextResponse.json({ error: "Unsupported provider" }, { status: 400 });
    }

    const result = streamText({
      model: provider as LanguageModelV1,
      system: "You are a helpful assistant.",
      messages,
      onFinish: async (data) => {
        console.log("Stream finished", data.usage);
        const newMessage = await prisma.message.create({
          data: {
            threadId: sessionId,
            userId: userId,
            model: model,
            input: messages[messages.length - 1].content,
            output: data.text,
            promptTokens: data.usage.promptTokens,
            completionTokens: data.usage.completionTokens,
          },
        });

        console.log("[newMessage created]", newMessage);

        // increment user message count
        await incrementUserMessageCount(userId);
      },
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

async function incrementUserMessageCount(userId: string) {
  try {
    const client = await clerkClient();

    // Fetch the user metadata
    const user = await client.users.getUser(userId);
    const metadata = user.publicMetadata || {};

    const messageCount: number = (metadata.message_count as number) || 0;
    const lifetimeMessageCount: number = (metadata.lifetime_message_count as number) || 0;
    const newMessageCount = messageCount + 1;
    const newLifetimeMessageCount = lifetimeMessageCount + 1;

    console.log("[incrementUserMessageCount]", {
      messageCount,
      newMessageCount,
      lifetimeMessageCount,
      newLifetimeMessageCount,
    });

    // Update the user metadata if needed
    if (newMessageCount > 0) {
      await client.users.updateUserMetadata(userId, {
        publicMetadata: {
          ...metadata,
          message_count: newMessageCount,
          lifetime_message_count: newLifetimeMessageCount,
        },
      });
    }
  } catch (error) {
    Sentry.captureException(error);
  }
}
