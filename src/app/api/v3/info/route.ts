import { NextResponse } from "next/server";
import { storeChatMessage } from "@/lib/chat/chat-utils";

export async function POST(req: Request) {
  const { sessionId, aiMessage } = await req.json();
  const result = await storeChatMessage(sessionId, aiMessage, req);

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
