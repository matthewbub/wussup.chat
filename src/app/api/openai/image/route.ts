import OpenAI from "openai";
import { NextResponse } from "next/server";
import { messageBuilder, unpackAttachments } from "@/lib/server-utils";
import { put } from "@vercel/blob";
import { auth } from "@clerk/nextjs/server";

export const runtime = "edge";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const formData = await request.formData();
    const incomingPrompt = formData.get("prompt");
    const messages = formData.get("messages");
    const attachments = unpackAttachments(formData);

    console.log("[attachments]", attachments);
    console.log("[messages]", messages);
    console.log("[incomingPrompt]", incomingPrompt);

    const messagesForConfig = messageBuilder(JSON.parse(messages as string));

    const openai = new OpenAI();

    const prompt =
      incomingPrompt ||
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

    if (!image_base64 || !userId) {
      return NextResponse.json(
        { error: "Missing image or userId" },
        { status: 400 }
      );
    }

    // Convert base64 to Buffer
    const image_bytes = Buffer.from(image_base64, "base64");

    // Generate a unique filename
    const timestamp = Date.now();
    const uniqueFilename = `generated-images/${userId}/${timestamp}.png`;

    // Upload to Vercel Blob
    const blob = await put(uniqueFilename, image_bytes, { access: "public" });

    console.log("[blob]", blob);
    // Return the blob URL in the response
    return NextResponse.json({
      url: blob.url,
      downloadUrl: blob.downloadUrl,
      pathname: blob.pathname,
      contentType: blob.contentType,
    });
  } catch (error) {
    console.error("Error generating image:", error);
    return NextResponse.json(
      { error: "Failed to generate image" },
      { status: 500 }
    );
  }
}
