import { createClient } from "@/lib/supabase-server";
import { getUser, supabaseFacade } from "@/lib/server-utils";
import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { TableNames } from "@/constants/tables";

export async function POST(req: Request) {
  const user = await getUser(req);

  const { title, session_id } = await req.json();
  const supabase = await createClient();
  const userData = await supabaseFacade.getOrMakeUser(user);

  if ("error" in userData) {
    Sentry.captureException(userData.error);
    return NextResponse.json({ error: userData.error }, { status: 500 });
  }

  // update session title
  const { error } = await supabase.from(TableNames.CHAT_SESSIONS).upsert(
    {
      name: title,
      user_id: userData.id,
      updated_at: new Date(),
      id: session_id,
    },
    {
      onConflict: "id",
    }
  );

  if (error) {
    console.error("Error updating session title", error);
    Sentry.captureException(error);
  }

  return NextResponse.json({ success: true });
}
