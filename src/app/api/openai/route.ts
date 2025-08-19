import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ApiChunk, OpenAiImageResponse } from "@/app/types";
import { OpenAiStreamer } from "@/lib/OpenAiStreamer";
import { streamOpenAiResponse } from "@/lib/streamOpenAiResponse";
import { mockStreamOpenAiResponse } from "@/lib/mockStreamOpenAiResponse";
import { streamHeaders } from "@/constants/app-config";
import { Unpacker } from "@/lib/Unpacker";
import { checkMessageLimits } from "@/lib/messageLimits";
import { appConfig } from "@/constants/app-config";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const { userId, has } = await auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const hasPaidPlan = has({ feature: appConfig.plans.pro });

  // Get user stats only
  const userStats = await prisma.stats.findUnique({
    where: { userId },
  });

  const { isOverDailyLimit } = checkMessageLimits(
    userStats?.dailyMessageCount,
    hasPaidPlan
  );

  // If user is over limit, return error
  if (isOverDailyLimit) {
    return new NextResponse(
      JSON.stringify({
        error: "Message limit exceeded. Please upgrade to Pro.",
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
  await openAiStreamer.determineModelTypeWithStructuredOutput();

  // ready the openai config
  const openAiConfig = await openAiStreamer.readyOpenAiConfig(userId);

  let streamer;
  if (openAiConfig.modelType === "image") {
    streamer = await openAiConfig.createOpenAiImageResponse(
      undefined,
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
