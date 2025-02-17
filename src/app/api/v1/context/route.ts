import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function POST(req: Request) {
  const { context } = await req.json();
  const supabase = await createClient();

  // get current user from request context
  const { data } = await supabase.auth.getUser();
  const userId = data?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "user id is required" }, { status: 400 });
  }

  const { error: contextError } = await supabase
    .from("ChatBot_Users")
    .update({ chat_context: context })
    .eq("user_id", userId);

  if (contextError) {
    return NextResponse.json({ error: contextError.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Context updated" }, { status: 200 });
}
