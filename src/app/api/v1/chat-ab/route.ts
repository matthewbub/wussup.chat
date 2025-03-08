import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { xai } from "@ai-sdk/xai";
import { experimental_generateImage, LanguageModelV1, streamText, tool } from "ai";
import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { AVAILABLE_MODELS } from "@/constants/models";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const formData = await req.formData();
  const content = formData.get("content") as string;
  const session_id = formData.get("session_id") as string;
  const model = formData.get("model") as string;
  const model_provider = formData.get("model_provider") as string;
  const chat_context = formData.get("chat_context") as string;
  const messageHistory = formData.get("messageHistory") as string;
  const response_type = formData.get("response_type") as "A" | "B";
  const response_group_id = formData.get("response_group_id") as string;
  const parent_message_id = formData.get("parent_message_id") as string;
  const attachments = formData.getAll("attachments") as File[];

  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const userId = data?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "user id is required" }, { status: 400 });
  }

  // Validate model and provider
  const selectedModel = AVAILABLE_MODELS.find((m) => m.id === model && m.provider === model_provider);
  if (!selectedModel) {
    return NextResponse.json({ error: "Invalid model or provider combination" }, { status: 400 });
  }

  // Prepare message content with attachments
  let messageContent = content;

  // Process attachments
  const experimental_attachments: {
    name: string;
    contentType: string;
    url: string;
  }[] = [];

  // Process attachments if they exist
  if (attachments && attachments.length > 0) {
    for (const file of attachments) {
      const buffer = await file.arrayBuffer();
      const base64Content = Buffer.from(buffer).toString("base64");

      if (file.type.startsWith("image/")) {
        experimental_attachments.push({
          name: file.name,
          contentType: file.type,
          url: `data:${file.type};base64,${base64Content}`,
        });
      } else if (file.type === "application/pdf") {
        experimental_attachments.push({
          name: file.name,
          contentType: "application/pdf",
          url: `data:application/pdf;base64,${base64Content}`,
        });
      } else if (file.type === "text/plain") {
        const textContent = new TextDecoder().decode(buffer);
        messageContent += `\n\nAttached Text Content:\n${textContent}`;
      }
    }
  }

  if (experimental_attachments.length > 0) {
    messageContent +=
      "\n\nAttachments:\n" +
      experimental_attachments
        .map((att) => {
          if (att.contentType.startsWith("image/")) {
            return `- Image: ${att.name}`;
          } else if (att.contentType === "application/pdf") {
            return `- PDF: ${att.name}`;
          }
          return `- File: ${att.name}`;
        })
        .join("\n");
  }

  // Prepare the messages array with the current message and attachments
  const currentMessage = {
    role: "user" as const,
    content: messageContent,
    experimental_attachments,
  };

  // Parse message history and add current message
  const messages = messageHistory
    ? [
        ...JSON.parse(messageHistory).map((msg: { is_user: boolean; content: string }) => ({
          role: msg.is_user ? ("user" as const) : ("assistant" as const),
          content: msg.content,
        })),
        currentMessage,
      ]
    : [currentMessage];

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
      tools: {
        generateImage: tool({
          description: "Generate an image",
          parameters: z.object({
            prompt: z.string().describe("The prompt to generate the image from"),
          }),
          execute: async ({ prompt }) => {
            const { image } = await experimental_generateImage({
              model: openai.image("dall-e-3"),
              prompt,
            });

            const imageBuffer = Buffer.from(image.base64, "base64");
            const imagePath = `${userId}/generated/${new Date().getFullYear()}/${crypto.randomUUID()}.png`;
            const { error: createError } = await supabase.storage
              .from("ChatBot_Images_Generated")
              .upload(imagePath, imageBuffer, {
                contentType: "image/png",
                cacheControl: "3600",
              });

            if (createError) {
              console.error("Error uploading image to storage", createError);
              throw new Error("Failed to upload generated image");
            }

            const {
              data: { publicUrl },
            } = supabase.storage.from("ChatBot_Images_Generated").getPublicUrl(imagePath);

            const { error: messageError } = await supabase.from("ChatBot_Messages").insert([
              {
                id: crypto.randomUUID(),
                chat_session_id: session_id,
                content: "",
                user_id: userId,
                is_user: false,
                created_at: new Date().toISOString(),
                response_type,
                response_group_id,
                parent_message_id,
                metadata: {
                  type: "image",
                  imageUrl: publicUrl,
                  prompt: prompt,
                  storagePath: imagePath,
                },
              },
            ]);

            if (messageError) {
              console.error("Error storing image message", messageError);
              throw new Error("Failed to store image message");
            }

            return { image: publicUrl, prompt };
          },
        }),
      },
    });

    return result.toDataStreamResponse({
      getErrorMessage: errorHandler,
    });
  } catch (error) {
    console.error("[Chat API] Error streaming response:", error);
    return NextResponse.json({ error: "Failed to generate response" }, { status: 500 });
  }
}

export function errorHandler(error: unknown) {
  if (error == null) {
    return "[Chat API] unknown error";
  }

  if (typeof error === "string") {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return JSON.stringify(error);
}
