import OpenAI from "openai";
import { NextResponse } from "next/server";
import { messageBuilder } from "@/lib/server-utils";

export const runtime = "edge";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const bodyPrompt = body.prompt;
    const messages = body.messages;

    const messagesForConfig = messageBuilder(messages);

    const openai = new OpenAI();

    const prompt =
      bodyPrompt ||
      `
    Generate an image for my brand/ AI Chatbot website: Wussup.Chat.
    The image should be a logo for the website, I was thinking of some mickey mouse style gloves with a peace sign.
    `;

    const result = await openai.images.generate({
      model: "gpt-image-1",
      prompt:
        "Heres the prompt: " +
        prompt +
        "\n\n Heres the message history for context: " +
        JSON.stringify(messagesForConfig),
    });

    const image_base64 = result.data?.[0]?.b64_json;

    if (!image_base64) {
      return NextResponse.json(
        { error: "Failed to generate image" },
        { status: 500 }
      );
    }

    // Convert base64 to Buffer
    const image_bytes = Buffer.from(image_base64, "base64");

    // Return the image directly in the response
    return new NextResponse(image_bytes, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Error generating image:", error);
    return NextResponse.json(
      { error: "Failed to generate image" },
      { status: 500 }
    );
  }
}
