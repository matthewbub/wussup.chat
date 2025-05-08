// https://platform.openai.com/docs/api-reference/responses-streaming/response
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ApiChunk, OpenAiImageResponse } from "@/app/types";
import {
  OpenAiStreamer,
  streamOpenAiResponse,
  Unpacker,
  mockStreamOpenAiResponse,
} from "@/lib/server-utils";
import { streamHeaders } from "@/constants/app-config";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const formData = await request.formData();
  const unpacker = new Unpacker(formData);

  // unpack the form data
  const unpackedConfig = await unpacker.unpack();
  const openAiStreamer = new OpenAiStreamer(unpackedConfig);

  // ready the openai config
  const openAiConfig = await openAiStreamer.readyOpenAiConfig(userId);
  const modelType = openAiConfig.getModelType();

  const streamer =
    modelType === "image"
      ? await openAiConfig.createOpenAiImageResponse(
          undefined,
          userId,
          unpackedConfig.prompt
        )
      : await openAiConfig.createOpenAiStreamResponse();

  // stream the openai response
  const stream = new ReadableStream({
    start: (controller) => {
      if (modelType === "image") {
        mockStreamOpenAiResponse(
          controller,
          streamer as unknown as AsyncIterable<ApiChunk> & OpenAiImageResponse
        );
      } else {
        streamOpenAiResponse(
          controller,
          streamer as unknown as AsyncIterable<ApiChunk>
        );
      }
    },
  });

  return new NextResponse(stream, streamHeaders);
}
