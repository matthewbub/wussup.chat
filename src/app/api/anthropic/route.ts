import { ApiChunk } from "@/app/types";
import { streamHeaders } from "@/constants/app-config";
import { AnthropicUnpacker, startAnthropicStream } from "@/lib/server-utils";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const formData = await request.formData();
    const unpacker = new AnthropicUnpacker(formData);
    const streamer = await unpacker
      .unpack()
      .unpackMessages()
      .unpackAttachments()
      .readyAnthropicConfig()
      .createAnthropicResponse();

    const stream = new ReadableStream({
      start: (controller) => {
        startAnthropicStream(
          streamer as unknown as AsyncIterable<ApiChunk>,
          controller
        );
      },
    });

    return new NextResponse(stream, streamHeaders);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
