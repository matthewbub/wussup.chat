import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { xai } from "@ai-sdk/xai";
import { experimental_generateImage, LanguageModelV1, streamText, tool, UIMessage } from "ai";
import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { AVAILABLE_MODELS } from "@/constants/models";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const {
    messages,
    data: { session_id, session_title, user_specified_model, model_provider, chat_context },
  } = await req.json();
  const supabase = await createClient();

  // get current user from request context
  const { data } = await supabase.auth.getUser();
  const userId = data?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "user id is required" }, { status: 400 });
  }

  // Validate model and provider
  const selectedModel = AVAILABLE_MODELS.find((m) => m.model === user_specified_model && m.provider === model_provider);

  if (!selectedModel) {
    return NextResponse.json({ error: "Invalid model or provider combination" }, { status: 400 });
  }

  const { error: sessionError } = await supabase
    .from("ChatBot_Sessions")
    .upsert({
      id: session_id,
      user_id: userId,
      updated_at: new Date().toISOString(),
    })
    .select();

  if (sessionError) {
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }

  const user_message_id = crypto.randomUUID();
  const user_created_at = new Date().toISOString();

  const upsertData: {
    id: string;
    updated_at: string;
    user_id: string;
    name?: string;
  } = {
    id: session_id,
    updated_at: new Date().toISOString(),
    user_id: userId,
  };

  // If the user has only sent one message, then we will use the default name as the session name
  // it increments from the client side
  const messageLength = messages.length;
  if (messageLength === 1) {
    upsertData.name = session_title;
  }

  // insert user message and increment message count concurrently
  const [{ error: userError }, { error: updateError }] = await Promise.all([
    supabase.from("ChatBot_Messages").insert([
      {
        id: user_message_id,
        chat_session_id: session_id,
        content: messages[messages.length - 1].content,
        user_id: userId,
        is_user: true,
        created_at: user_created_at,
        model: user_specified_model,
        model_provider: model_provider,
      },
    ]),
    supabase.rpc("increment_message_count", {
      incoming_uid: userId,
      increment_by: 1,
    }),
  ]);

  if (userError || updateError) {
    console.error("[Chat API] Error inserting user message: ", userError || updateError);
  }

  console.log("[Chat API] Successfully inserted user message");

  // filter through messages and remove base64 image data to avoid sending to the model
  const formattedMessages = messages.map((m: UIMessage) => {
    if (m.role === "assistant" && m.parts) {
      m.parts.forEach((ti) => {
        if (
          ti.type === "tool-invocation" &&
          ti.toolInvocation.toolName === "generateImage" &&
          ti.toolInvocation.state === "result"
        ) {
          ti.toolInvocation.result.image = `redacted-for-length`;
        }
      });
    }
    return m;
  });

  // Select the appropriate provider based on model_provider
  let provider;
  switch (model_provider) {
    case "openai":
      provider = openai(user_specified_model);
      break;
    case "anthropic":
      provider = anthropic(user_specified_model);
      break;
    case "google":
      provider = google(user_specified_model);
      break;
    case "xai":
      provider = xai(user_specified_model);
      break;
    default:
      return NextResponse.json({ error: "Unsupported provider" }, { status: 400 });
  }

  const result = streamText({
    model: provider as LanguageModelV1,
    system: chat_context,
    messages: formattedMessages,
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

          console.log("image", image);

          // Decode base64 to Buffer before uploading
          const imageBuffer = Buffer.from(image.base64, "base64");

          // Add content-type and more structured path
          const imagePath = `${userId}/generated/${new Date().getFullYear()}/${crypto.randomUUID()}.png`;
          const { data: uploadData, error: createError } = await supabase.storage
            .from("ChatBot_Images_Generated")
            .upload(imagePath, imageBuffer, {
              contentType: "image/png",
              cacheControl: "3600",
            });

          if (createError) {
            console.error("Error uploading image to storage", createError);
            throw new Error("Failed to upload generated image");
          }

          console.log("uploadData", uploadData);

          // Get public URL for the uploaded image
          const {
            data: { publicUrl },
          } = supabase.storage.from("ChatBot_Images_Generated").getPublicUrl(imagePath);

          // After successfully uploading the image, store the message with image metadata
          const { error: messageError } = await supabase.from("ChatBot_Messages").insert([
            {
              id: crypto.randomUUID(),
              chat_session_id: session_id,
              content: "", // Empty content since this is an image message
              user_id: userId,
              is_user: false,
              created_at: new Date().toISOString(),
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

          // Return the public URL instead of base64
          return { image: publicUrl, prompt };
        },
      }),
    },
  });

  return result.toDataStreamResponse();
}
