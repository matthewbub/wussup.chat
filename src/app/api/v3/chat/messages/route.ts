import { NextResponse } from "next/server";
import { getUserFromHeaders, upsertUserByIdentifier } from "@/lib/auth/auth-utils";
import { supabase } from "@/lib/supabase";
import * as Sentry from "@sentry/nextjs";
import { tableNames } from "@/constants/tables";
import { headers } from "next/headers";

export async function GET(req: Request) {
  try {
    // Get session_id from URL params
    const url = new URL(req.url);
    const session = url.searchParams.get("session");

    if (!session) {
      return NextResponse.json({ error: "Missing session_id parameter" }, { status: 400 });
    }

    // Get and validate user
    const user = await getUserFromHeaders(headers());
    const userData = await upsertUserByIdentifier(user);

    if ("error" in userData) {
      Sentry.captureException(userData.error);
      return NextResponse.json({ error: userData.error }, { status: 500 });
    }

    // Fetch chat messages
    const { data, error } = await supabase
      .from(tableNames.CHAT_MESSAGES)
      .select("*")
      .eq("user_id", userData.id)
      .eq("chat_session_id", session);

    if (error) {
      Sentry.captureException(error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ messages: data });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}
