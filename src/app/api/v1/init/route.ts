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
    return NextResponse.json({ error: "User ID is required", code: "user_id_required" }, { status: 400 });
  }

  try {
    // Ensure user folder exists within ChatBot_Images_Generated bucket
    const { data: folderList, error: listError } = await supabase.storage.from("ChatBot_Images_Generated").list(userId);

    if (listError) {
      throw new Error(`Failed to check user folder: ${listError.message}`);
    }

    console.log("folderList", folderList);

    if (!folderList || folderList.length === 0) {
      // Create an empty .keep file to initialize the folder
      const { error: createError } = await supabase.storage
        .from("ChatBot_Images_Generated")
        .upload(`${userId}/.keep`, new Blob([""]));

      if (createError) {
        throw new Error(`Failed to create user folder: ${createError.message}`);
      }
    }

    // TODO: Move this to RPC
    const [sessionsResult, messagesResult, usersResult] = await Promise.all([
      supabase.from("ChatBot_Sessions").select("*").eq("user_id", userId),
      supabase.from("ChatBot_Messages").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
      supabase
        .from("ChatBot_Users")
        .select(
          "email, message_count, stripeSubscriptionId, subscriptionStatus, user_id, subscriptionPeriodEnd, chat_context"
        )
        .eq("user_id", userId)
        .single(),
    ]);

    if (sessionsResult.error || messagesResult.error) {
      // todo: response with something better
      throw new Error("Failed to fetch data");
    }

    // Create a Map to index messages by chat_session_id
    const messagesBySessionId = new Map();
    messagesResult.data.forEach((message) => {
      const sessionMessages = messagesBySessionId.get(message.chat_session_id) || [];
      sessionMessages.push(message);
      messagesBySessionId.set(message.chat_session_id, sessionMessages);
    });

    const sessionsWithMessages = sessionsResult.data.map((session) => ({
      ...session,
      messages: messagesBySessionId.get(session.id) || [],
    }));

    return NextResponse.json({
      sessions: sessionsWithMessages,
      user: usersResult.data,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
