// https://platform.openai.com/docs/api-reference/responses-streaming/response
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ApiChunk } from "@/app/types";
import { OpenAiUnpacker, startOpenAiStream } from "@/lib/server-utils";
import { streamHeaders } from "@/constants/app-config";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const formData = await request.formData();
  const unpacker = new OpenAiUnpacker(formData);
  const streamer = await unpacker
    .unpack()
    .unpackAttachments()
    .unpackMessages()
    .readyOpenAiConfig(userId)
    .createOpenAiResponse();

  const stream = new ReadableStream({
    start: (controller) => {
      startOpenAiStream(
        streamer as unknown as AsyncIterable<ApiChunk>,
        controller
      );
    },
  });

  return new NextResponse(stream, streamHeaders);
}
