import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import * as Sentry from "@sentry/nextjs";
import { tableNames } from "@/constants/tables";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const session = url.searchParams.get("session");
  if (!session) {
    return NextResponse.json({ error: "Missing session_id parameter" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from(tableNames.CHAT_MESSAGES)
    .select("*")
    .eq("user_id", userId)
    .eq("chat_session_id", session)
    .order("created_at", { ascending: true });

  if (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ messages: data });
}
