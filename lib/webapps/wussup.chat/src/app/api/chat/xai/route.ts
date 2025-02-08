import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import OpenAI from "openai";
import { formatContextMessages } from "@/lib/utils";

export async function POST(request: Request) {
  const {
    message,
    history,
    sessionId,
    userMessageId,
    botMessageId,
    userCreatedAt,
    botCreatedAt,
    model,
  } = await request.json();
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user?.id;

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

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

      // TODO: Detect which model was used and enforce limits
    }),
  ]);

  if (updateError || userError) {
    console.error("[Chat API Error]", updateError || userError);
    // Continue processing even if count update fails
  }

  // Filter out empty messages and deduplicate
  const contextMessages = formatContextMessages(history);
  // Add the new message to the context
  contextMessages.push({ role: "user", content: message });

  try {
    if (!Array.isArray(contextMessages) || contextMessages.length === 0) {
      throw new Error("Invalid context messages format");
    }

    // Initialize XAI with OpenAI interface
    const openai = new OpenAI({
      apiKey: process.env.XAI_API_KEY,
      baseURL: "https://api.x.ai/v1",
    });

    // Create stream with XAI
    const stream = await openai.chat.completions.create({
      model: model as string,
      messages: contextMessages as OpenAI.Chat.ChatCompletionMessageParam[],
      stream: true,
    });

    // Create readable stream for response
    const responseStream = new ReadableStream({
      async start(controller) {
        let completeBotMessage = "";

        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content;
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
            console.error("Error updating bot message:", error);
          }
          controller.close();
        } catch (error) {
          console.error("Stream error:", error);
          controller.error(error);
        }
      },
    });

    return new Response(responseStream, {
      headers: { "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    return NextResponse.json({ response: error }, { status: 500 });
  }
}
