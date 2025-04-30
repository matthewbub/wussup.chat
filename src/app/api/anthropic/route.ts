import { messageBuilder } from "@/lib/server-utils";
import { Anthropic } from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const anthropic = new Anthropic();

    const body = await request.json();

    const prompt = body.prompt;
    const metaOpts = body.metaOpts;
    const messages = body.messages;

    const messagesForConfig = messageBuilder(messages);

    const config = {
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 2000,
      messages: [...messagesForConfig, { role: "user", content: prompt }],
      stream: true,
    } as Anthropic.MessageCreateParamsStreaming;

    if (metaOpts === "thinking") {
      config.thinking = {
        type: "enabled",
        budget_tokens: 1600,
      };
    }

    const response = await anthropic.messages.create(config);

    // Create a readable stream
    const stream = new ReadableStream({
      async start(controller) {
        const sequences: { type: string; content: string }[] = [];
        let currentType: string | null = null;
        let currentContent = "";

        const updateSequence = (type: string) => {
          // if the type has changed, push what we had collected into the sequences array
          // and prepare to collect the next type
          if (currentType && currentType !== type) {
            sequences.push({
              type: currentType,
              content: currentContent,
            });
            currentContent = "";
          }

          currentType = type;
        };

        for await (const chunk of response as unknown as AsyncIterable<{
          type: string;
          delta?: { thinking?: string; text?: string };
        }>) {
          updateSequence(chunk.type);
          // continuously add to the current content until the type changes
          // this means we don't have to be additive on the client side
          // we can just replace the content with the new chunk
          currentContent += chunk?.delta?.thinking || chunk?.delta?.text || "";

          controller.enqueue(
            `data: ${JSON.stringify({
              type: chunk.type,
              sequences: [
                ...sequences,
                {
                  type: currentType,
                  content: currentContent,
                },
              ],
            })}\n\n`
          );
        }
        controller.close();
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
