import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const {
    created_at,
    content,
    role,
    message_id,
    session_id,
    // prompt_tokens,
    // completion_tokens,
    // total_tokens,
  } = await req.json();
  console.log(created_at, content, role, message_id);

  // TODO: Save the info to the database
  const supabase = await createClient();

  // get current user from request context
  const { data } = await supabase.auth.getUser();
  const userId = data?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "user id is required" }, { status: 400 });
  }

  const [{ error: userError }, { error: updateError }] = await Promise.all([
    supabase.from("ChatBot_Messages").insert([
      {
        // id: message_id,
        chat_session_id: session_id,
        content: content,
        user_id: userId,
        is_user: false,
        model: null,
        created_at: created_at,
      },
    ]),
    supabase.rpc("increment_message_count", {
      incoming_uid: userId,
      increment_by: 1,
      // todo: detect which model was used and enforce limits
    }),
  ]);

  if (updateError || userError) {
    console.error("[chat api error]", updateError || userError);
    // continue processing even if count update fails
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
