import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { formatContextMessages } from "@/lib/utils";

// add type for gemini messages
type GeminiMessage = {
  role: "user" | "model";
  parts: { text: string }[];
};

// post handler for google ai chat stream using gemini (all comments in lowercase)
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
    // validate model name
    if (!model || typeof model !== "string") {
      throw new Error("invalid model parameter");
    }

    // initialize google ai client using gemini api key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("gemini api key not configured");
    }
    const genAI = new GoogleGenerativeAI(apiKey);

    // get generative model for gemini
    const gaModel = genAI.getGenerativeModel({ model });

    // convert context messages to google's gemini chat format with type safety
    const geminiMessages: GeminiMessage[] = contextMessages.map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    // start chat with history context
    const chat = gaModel.startChat({
      history: geminiMessages,
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.7,
      },
    });

    // send the new message and get the stream from google ai
    const result = await chat.sendMessageStream(message);

    // create readable stream for response
    const responseStream = new ReadableStream({
      async start(controller) {
        // accumulate complete bot message for later database insertion
        let completeBotMessage = "";
        try {
          // iterate over each chunk from the google ai stream
          for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            if (chunkText) {
              completeBotMessage += chunkText;
              // format response to match expected client format
              const response = {
                choices: [
                  {
                    delta: {
                      content: chunkText,
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
    console.error("[gemini api error]", error);
    return NextResponse.json(
      { error: "An error occurred while processing your request" },
      { status: 500 }
    );
  }
}
