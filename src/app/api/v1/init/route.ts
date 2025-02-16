import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

// get chat sessions and messages for a user
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user?.id;

  if (!userId) {
    return NextResponse.json(
      { error: "User ID is required", code: "user_id_required" },
      { status: 400 }
    );
  }

  try {
    // TODO: Move this to RPC
    const [sessionsResult, messagesResult, usersResult] = await Promise.all([
      supabase.from("ChatBot_Sessions").select("*").eq("user_id", userId),
      supabase.from("ChatBot_Messages").select("*").eq("user_id", userId),
      supabase
        .from("ChatBot_Users")
        .select(
          "email, message_count, stripeSubscriptionId, subscriptionStatus, user_id, subscriptionPeriodEnd"
        )
        .eq("user_id", userId)
        .single(),
    ]);

    if (sessionsResult.error || messagesResult.error) {
      // todo: response with something better
      throw new Error("Failed to fetch data");
    }

    // todo improve the algo
    const sessionsWithMessages = [];
    for (const session of sessionsResult.data) {
      const messages = messagesResult.data.filter(
        (message) => message.chat_session_id === session.id
      );
      sessionsWithMessages.push({ ...session, messages });
    }

    return NextResponse.json({
      sessions: sessionsWithMessages,
      user: usersResult.data,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
