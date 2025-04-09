import { getUserId } from "@/lib/chat/chat-utils";
import { supabase } from "@/lib/supabase";
import { tableNames } from "@/constants/tables";
import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

/**
 * Duplicates a chat session and all its messages
 */
export async function POST(req: Request) {
  try {
    const userId = await getUserId(req);
    const { sessionId, newSessionId } = await req.json();

    // Get the session to duplicate
    const { data: session, error: sessionError } = await supabase
      .from(tableNames.CHAT_SESSIONS)
      .select("name")
      .eq("id", sessionId)
      .eq("user_id", userId)
      .single();

    if (sessionError) {
      Sentry.captureException(sessionError);
      return NextResponse.json({ error: "Failed to fetch chat session" }, { status: 500 });
    }

    // Get all messages from the original session
    const { data: messages, error: messagesError } = await supabase
      .from(tableNames.CHAT_MESSAGES)
      .select("*")
      .eq("chat_session_id", sessionId)
      .eq("user_id", userId);

    if (messagesError) {
      Sentry.captureException(messagesError);
      return NextResponse.json({ error: "Failed to fetch chat messages" }, { status: 500 });
    }

    const newSessionName = `${session?.name || "Chat"} (copy)`;
    const { error: newSessionError } = await supabase.from(tableNames.CHAT_SESSIONS).insert({
      id: newSessionId,
      user_id: userId,
      name: newSessionName,
    });

    if (newSessionError) {
      Sentry.captureException(newSessionError);
      return NextResponse.json({ error: "Failed to create new chat session" }, { status: 500 });
    }

    // Duplicate all messages with the new session ID
    if (messages && messages.length > 0) {
      const newMessages = messages.map((msg) => ({
        ...msg,
        id: crypto.randomUUID(),
        chat_session_id: newSessionId,
        created_at: new Date(),
      }));

      const { error: newMessagesError } = await supabase.from(tableNames.CHAT_MESSAGES).insert(newMessages);

      if (newMessagesError) {
        // If message copy fails, delete the new session to maintain consistency
        await supabase.from(tableNames.CHAT_SESSIONS).delete().eq("id", newSessionId);
        Sentry.captureException(newMessagesError);
        return NextResponse.json({ error: "Failed to copy chat messages" }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, sessionId: newSessionId, name: newSessionName }, { status: 200 });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "Failed to duplicate chat session" }, { status: 500 });
  }
}
