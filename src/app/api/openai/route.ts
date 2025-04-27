// https://platform.openai.com/docs/api-reference/responses-streaming/response
import OpenAI from "openai";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { THINKING } from "../anthropic/route";

interface ChunkSequence {
  type: string;
  count: number;
  content: string;
}
export const REASONING = "response.reasoning_summary_text.delta";
export const OUTPUT = "response.output_text.delta";
export const IN_PROGRESS = "response.in_progress";

// Define our own interface for the OpenAI response config
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

  const webmodel = "gpt-4.1";
  const thinkingmodel = "o4-mini";

  // Create config with our custom interface
  const opConfig: OpenAIConfig = {
    model: thinkingmodel,
    stream: true,
    input: [{ role: "user", content: prompt.trim() }],
    // https://platform.openai.com/docs/guides/safety-best-practices#end-user-ids
    user: userId,
  };

  if (metaOpts === THINKING) {
    opConfig.model = thinkingmodel;
    opConfig.reasoning = {
      effort: "medium",
      summary: "auto", // Enable reasoning summaries
    };
  }
  // cant call both
  else if (metaOpts === "webSearch") {
    opConfig.model = webmodel;
    opConfig.tools = [{ type: "web_search_preview" }];
  }

  // Use a more specific type assertion
  const response = await openai.responses.create(
    // @ts-expect-error The OpenAI SDK types don't match our usage
    opConfig
  );

  // Create a readable stream
  const stream = new ReadableStream({
    async start(controller) {
      const sequences: ChunkSequence[] = [];
      let currentType: string | null = null;
      let currentCount = 0;
      let currentContent = "";

      const updateSequence = (type: string) => {
        if (currentType && currentCount > 0) {
          sequences.push({
            type: currentType,
            count: currentCount,
            content: currentContent,
          });
        }
        if (currentType !== type) {
          currentType = type;
          currentCount = 0;
          currentContent = "";
        }
      };

      // Type assertion for proper iteration
      for await (const chunk of response as unknown as AsyncIterable<{
        type: string;
        delta?: string;
      }>) {
        updateSequence(chunk.type);

        const delta = chunk?.delta ?? ""; // Ensure delta is not null/undefined
        if (delta) {
          currentContent += delta;
          currentCount++; // Increment count if you plan to use it
        }

        controller.enqueue(
          `data: ${JSON.stringify({
            type: chunk.type,
            sequences: [
              ...sequences,
              {
                type: currentType,
                count: currentCount,
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
}
