// https://platform.openai.com/docs/api-reference/responses-streaming/response
import OpenAI from "openai";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ApiChunk } from "@/app/types";
import { messageBuilder } from "@/lib/server-utils";

interface ApiChunkSequence {
  type: string;
  content: string;
}

interface OpenAIConfig {
  model: string;
  stream: boolean;
  input: { role: string; content: string }[];
  user: string;
  reasoning?: {
    effort: string;
    summary: string;
  };
  tools?: Array<{
    type: string;
  }>;
}

export async function POST(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const body = await req.json();
  const prompt = body.prompt;
  const metaOpts = body.metaOpts;
  const messages = body.messages;

  const messagesForConfig = messageBuilder(messages);

  const webmodel = "gpt-4.1";
  const thinkingmodel = "o4-mini";

  // Create config with our custom interface
  const opConfig: OpenAIConfig = {
    model: thinkingmodel,
    stream: true,
    input: [...messagesForConfig, { role: "user", content: prompt.trim() }],
    // https://platform.openai.com/docs/guides/safety-best-practices#end-user-ids
    user: userId,
  };

  if (metaOpts === "thinking") {
    opConfig.model = thinkingmodel;
    opConfig.reasoning = {
      effort: "medium",
      summary: "auto",
    };
  }
  // cant call both thinking and webSearch
  else if (metaOpts === "webSearch") {
    opConfig.model = webmodel;
    opConfig.tools = [{ type: "web_search_preview" }];
  }

  const response = await openai.responses.create(
    // @ts-expect-error The OpenAI SDK types don't match our usage
    opConfig
  );

  // Create a readable stream
  const stream = new ReadableStream({
    async start(controller) {
      const sequences: ApiChunkSequence[] = [];
      let currentType: string | null = null;
      let currentContent = "";

      const updateSequence = (type: string) => {
        // if the type has changed, push what we had collected into the sequences array
        // and prepare to collect the next type
        if (currentType) {
          sequences.push({
            type: currentType,
            content: currentContent,
          });
        }
        if (currentType !== type) {
          currentType = type;
          currentContent = "";
        }
      };

      for await (const chunk of response as unknown as AsyncIterable<ApiChunk>) {
        updateSequence(chunk.type);

        const delta = chunk?.delta ?? "";
        if (delta) {
          // continuously add to the current content until the type changes
          // this means we don't have to be additive on the client side
          // we can just replace the content with the new chunk
          currentContent += delta;
        }

        controller.enqueue(
          `data: ${JSON.stringify({
            type: chunk.type,
            sequences: [
              ...sequences,
              {
                type: currentType,
                content: currentContent,
                part: chunk?.part ?? null,
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
}
