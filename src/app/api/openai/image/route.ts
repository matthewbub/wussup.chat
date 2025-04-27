import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "edge"; // Optional: use edge runtime for better performance

export async function POST() {
  try {
    const openai = new OpenAI();

    const prompt = `
    Generate an image for my brand/ AI Chatbot website: Wussup.Chat.
    The image should be a logo for the website, I was thinking of some mickey mouse style gloves with a peace sign.
    `;

    const result = await openai.images.generate({
      model: "gpt-image-1",
      prompt,
      // response_format: "b64_json",
    });

    const image_base64 = result.data[0].b64_json;

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
