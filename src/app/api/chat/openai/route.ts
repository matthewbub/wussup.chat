import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import OpenAI from "openai";
import { formatContextMessages } from "@/lib/utils";

// post handler for openai chat stream
export async function POST(request: Request) {
  // parse incoming request
  const {
    message,
    history,
    sessionId,
    userMessageId,
    botMessageId,
    userCreatedAt,
    botCreatedAt,
    // TODO: Validate model
    model,
  } = await request.json();
  const supabase = await createClient();

  // get current user from request context
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user?.id;

  if (!userId) {
    return NextResponse.json({ error: "user id is required" }, { status: 400 });
  }

  // insert user message and increment message count concurrently
  const [{ error: userError }, { error: updateError }] = await Promise.all([
    supabase.from("ChatBot_Messages").insert({
      id: userMessageId,
      chat_session_id: sessionId,
      content: message,
      user_id: userId,
      is_user: true,
      model: null,
      created_at: userCreatedAt,
    }),
    supabase.rpc("increment_message_count", {
      incoming_uid: userId,
      increment_by: 2,
      // todo: detect which model was used and enforce limits
    }),
  ]);

  if (updateError || userError) {
    console.error("[chat api error]", updateError || userError);
    // continue processing even if count update fails
  }

  // filter out empty messages and deduplicate
  const contextMessages = formatContextMessages(history);
  // add the new message to the context
  contextMessages.push({ role: "user", content: message });

  try {
    // ensure valid context messages format
    if (!Array.isArray(contextMessages) || contextMessages.length === 0) {
      throw new Error("invalid context messages format");
    }

    // initialize openai client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // create stream from openai
    const stream = await openai.chat.completions.create({
      model: model as string,
      messages: contextMessages,
      stream: true,
    });

    // create readable stream for response
    const responseStream = new ReadableStream({
      async start(controller) {
        let completeBotMessage = "";
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
              completeBotMessage += content;
              const response = {
                choices: [
                  {
                    delta: {
                      content: content,
                    },
                  },
                ],
              };
              controller.enqueue(`data: ${JSON.stringify(response)}\n\n`);
            }
          }

          // insert complete bot message to database
          try {
            await supabase.from("ChatBot_Messages").insert({
              id: botMessageId,
              chat_session_id: sessionId,
              content: completeBotMessage,
              user_id: userId,
              is_user: false,
              model: model as string,
              created_at: botCreatedAt,
            });
          } catch (error) {
            console.error("error updating bot message:", error);
          }
          controller.close();
        } catch (error) {
          console.error("stream error:", error);
          controller.error(error);
        }
      },
    });

    return new Response(responseStream, {
      headers: { "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("error:", error);
    return NextResponse.json({ response: error }, { status: 500 });
  }
}
