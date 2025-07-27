import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ApiChunk, OpenAiImageResponse } from "@/app/types";
import { OpenAiStreamer } from "@/lib/OpenAiStreamer";
import { streamOpenAiResponse } from "@/lib/streamOpenAiResponse";
import { mockStreamOpenAiResponse } from "@/lib/mockStreamOpenAiResponse";
import { streamHeaders } from "@/constants/app-config";
import { Unpacker } from "@/lib/Unpacker";
import { checkMessageLimits, ensureDailyReset } from "@/lib/messageLimits";
import { appConfig } from "@/constants/app-config";

export async function POST(request: Request) {
  const { userId, has } = await auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const hasPaidPlan = has({ feature: appConfig.plans.pro });

  // Check and reset daily message count if needed
  const dailyMessageCount = await ensureDailyReset(userId);

  const { isOverDailyLimit } = checkMessageLimits(
    dailyMessageCount,
    hasPaidPlan
  );

  // If user is over limit
  if (isOverDailyLimit) {
    return new NextResponse(
      JSON.stringify({
        error:
          "Message limit exceeded. Please add an API key to continue using the service.",
      }),
      { status: 403 }
    );
  }

  const formData = await request.formData();
  const unpacker = new Unpacker(formData);
  const unpackedConfig = await unpacker.unpack();

  // ready the openai config
  const openAiStreamer = new OpenAiStreamer({
    messages: unpackedConfig.messages,
    prompt: unpackedConfig.prompt,
    images: unpackedConfig.images,
  });

  // determine the model type
  await openAiStreamer.routeRequest();

  // ready the openai config
  const openAiConfig = await openAiStreamer.readyOpenAiConfig(userId);

  let streamer;
  if (openAiConfig.modelType === "image") {
    streamer = await openAiConfig.createOpenAiImageResponse(
      userId,
      unpackedConfig.prompt
    );
  } else {
    streamer = await openAiConfig.createOpenAiStreamResponse();
  }

  // stream the openai response
  const stream = new ReadableStream({
    start: (controller) => {
      if (openAiConfig.modelType === "image") {
        // images dont stream so we mock it
        mockStreamOpenAiResponse(
          controller,
          streamer as unknown as AsyncIterable<ApiChunk> & OpenAiImageResponse
        );
      } else {
        // https://platform.openai.com/docs/api-reference/responses-streaming/response
        streamOpenAiResponse(
          controller,
          streamer as unknown as AsyncIterable<ApiChunk>
        );
      }
    },
  });

  return new NextResponse(stream, streamHeaders);
}
