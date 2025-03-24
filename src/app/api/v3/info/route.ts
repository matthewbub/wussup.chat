import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  const { userId } = await auth();
  const ip = getIpAddress(req.headers);

  const user = {
    userId: userId ?? ip,
    type: userId ? "clerk_user_id" : "user_ip",
  };

  const body = await req.json();
  const { sessionId, aiMessage } = body;

  // Initialize Supabase client
  const supabase = await createClient();

  let { data: userData, error: userError } = await supabase
    .from("UserMetaData")
    .select("id")
    .eq(user.type, user.userId)
    .single();

  console.log("[Info API] User:", userData, userError);
  if (!userData) {
    console.log("[Info API] User not found, creating user...");
    console.log("[Info API] User:", user);
    const { data: newUser, error: createError } = await supabase
      .from("UserMetaData")
      .insert([{ [user.type]: user.userId }])
      .select()
      .single();

    if (createError) {
      console.error("[Info API] Error creating user:", createError);
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
    }

    userData = newUser;
  }

  const { error: sessionError } = await supabase.from("ChatSessions").upsert({
    id: sessionId,
    user_id: userData?.id,
  });

  if (sessionError) {
    console.error("[Info API] Error fetching session:", sessionError);
    return NextResponse.json({ error: "Failed to fetch session" }, { status: 500 });
  }

  // Store chat usage data
  const { error } = await supabase.from("Chats").insert({
    chat_session_id: sessionId,
    user_id: userData?.id,
    model: aiMessage.model,
    input: aiMessage.input,
    output: aiMessage.output,
    prompt_tokens: aiMessage.prompt_tokens,
    completion_tokens: aiMessage.completion_tokens,
  });

  if (error) {
    console.error("[Info API] Error storing chat usage:", error);
    return NextResponse.json({ error: "Failed to store chat usage" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

// Get IP address from X-Forwarded-For header or fall back to the direct connection IP
function getIpAddress(headersList: Headers) {
  return headersList.get("x-forwarded-for") ?? headersList.get("x-real-ip") ?? "Unknown";
}
