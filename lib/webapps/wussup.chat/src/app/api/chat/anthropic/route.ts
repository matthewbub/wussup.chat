import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import Anthropic from "@anthropic-ai/sdk";
import { formatContextMessages } from "@/lib/utils";

/*
 * post route handler for anthropic chat completions.
 * this function receives the request, saves the user message,
 * converts the context to anthropic format, calls the anthropic sdk,
 * saves the bot message, and streams the response back via sse.
 */
export async function POST(request: Request) {
  // extract data from the request body
  const {
    message,
    history,
    sessionId,
    userMessageId,
    botMessageId,
    userCreatedAt,
    botCreatedAt,
  } = await request.json();

  // create supabase client
  const supabase = await createClient();

  // get user id from supabase auth
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
  // add the new user message to the context
  contextMessages.push({ role: "user", content: message });

  try {
    if (!Array.isArray(contextMessages) || contextMessages.length === 0) {
      throw new Error("invalid context messages format");
    }

    // convert context messages to anthropic format
    const systemPrompt = "you are a helpful assistant.";
    const anthropicMessages = contextMessages.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    }));

    // initialize anthropic sdk
    const anthropic = new Anthropic();

    // create a readable stream to handle the anthropic response
    const responseStream = new ReadableStream({
      async start(controller) {
        try {
          // create streaming chat completion
          const stream = await anthropic.messages.stream({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 1000,
            temperature: 0,
            system: systemPrompt,
            messages: anthropicMessages,
          });

          let completeBotMessage = "";

          // handle text chunks as they arrive
          stream.on("text", (text) => {
            completeBotMessage += text;

            // send each chunk to the client
            const payload = {
              choices: [
                {
                  delta: {
                    content: text,
                  },
                },
              ],
            };
            controller.enqueue(`data: ${JSON.stringify(payload)}\n\n`);
          });

          // handle end of stream
          await stream.done();

          // save complete message to database
          try {
            await supabase.from("ChatBot_Messages").insert({
              id: botMessageId,
              chat_session_id: sessionId,
              content: completeBotMessage,
              user_id: userId,
              is_user: false,
              model: "claude-3-5-sonnet-20241022",
              created_at: botCreatedAt,
            });
          } catch (error) {
            console.error("error updating bot message:", error);
          }

          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(responseStream, {
      headers: { "Content-Type": "text/event-stream" },
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { response: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
