import { NextResponse } from "next/server";
import { ChatFacade } from "@/lib/chat-facade";

export async function POST(req: Request) {
  const body = await req.json();
  const { sessionId, aiMessage } = body;

  const result = await ChatFacade.storeChatMessage(sessionId, aiMessage, req);

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
