import { getUserId } from "@/lib/chat/chat-utils";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { tableNames } from "@/constants/tables";

/**
 * Update a thread's name
 */
export async function POST(req: Request) {
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { threadId, name } = await req.json();

  if (!threadId || !name) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from(tableNames.CHAT_SESSIONS)
    .update({ name, updated_at: new Date() })
    .eq("id", threadId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
