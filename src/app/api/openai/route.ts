// https://platform.openai.com/docs/api-reference/responses-streaming/response
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ApiChunk } from "@/app/types";
import {
  OpenAiStreamer,
  streamOpenAiResponse,
  Unpacker,
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
  const config = await unpacker.unpack();
  const openAiStreamer = new OpenAiStreamer(config.get());

  // ready the openai config
  const streamer = await openAiStreamer
    .readyOpenAiConfig(userId)
    .createOpenAiResponse();

  // stream the openai response
  const stream = new ReadableStream({
    start: (controller) => {
      streamOpenAiResponse(
        controller,
        streamer as unknown as AsyncIterable<ApiChunk>
      );
    },
  });

  return new NextResponse(stream, streamHeaders);
}
