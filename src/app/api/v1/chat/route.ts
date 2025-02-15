import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const {
    messages,
    data: { session_id },
  } = await req.json();
  const supabase = await createClient();

  // get current user from request context
  const { data } = await supabase.auth.getUser();
  const userId = data?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "user id is required" }, { status: 400 });
  }

  const user_message_id = crypto.randomUUID();
  const user_created_at = new Date().toISOString();

  const { data: session_data, error: session_error } = await supabase
    .from("ChatBot_Sessions")
    .upsert({
      id: session_id,
      updated_at: new Date().toISOString(),
      user_id: userId,
    })
    .select("*")
    .single();

  if (session_error) {
    console.error("[chat api error]", session_error);
    return NextResponse.json(
      { error: "Failed to get or create session" },
      { status: 500 }
    );
  }

  console.log("Session data", session_data);

  // insert user message and increment message count concurrently
  const [{ error: userError }, { error: updateError }] = await Promise.all([
    supabase.from("ChatBot_Messages").insert([
      {
        id: user_message_id,
        chat_session_id: session_id,
        content: messages[messages.length - 1].content,
        user_id: userId,
        is_user: true,
        created_at: user_created_at,
      },
    ]),
    supabase.rpc("increment_message_count", {
      incoming_uid: userId,
      increment_by: 1,
    }),
  ]);

  if (userError || updateError) {
    console.error("[chat api error]", userError || updateError);
    // continue processing even if count update fails
  }

  console.log("Successfully inserted user message");

  const result = streamText({
    model: openai("gpt-4-turbo"),
    system: "You are a helpful assistant.",
    messages,
  });

  return result.toDataStreamResponse();
}
