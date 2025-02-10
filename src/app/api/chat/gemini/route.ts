import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import { formatContextMessages } from "@/lib/utils";

// add type for gemini messages
type GeminiMessage = {
  role: "user" | "model";
  parts: { text: string }[];
};

// post handler for google ai chat stream using gemini (all comments in lowercase)
export async function POST(request: Request) {
  try {
    // parse incoming request
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

    // get current user from request context
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const userId = user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "user id is required" },
        { status: 400 }
      );
    }

    // validate model name
    if (!model || typeof model !== "string") {
      return NextResponse.json(
        { error: "invalid model parameter" },
        { status: 400 }
      );
    }

    // initialize google ai client using gemini api key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "gemini api key not configured" },
        { status: 500 }
      );
    }

    // handle database operations
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
      }),
    ]);

    if (userError) {
      console.error("[chat api error]", userError);
      return NextResponse.json(
        { error: "Failed to save user message" },
        { status: 500 }
      );
    }
    if (updateError) {
      console.error("[chat api error]", updateError);
      // continue processing even if count update fails
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const gaModel = genAI.getGenerativeModel({
      model,
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
        },
      ],
    });

    // perform initial safety check
    const result = await gaModel.generateContent(message);
    if (result.response.promptFeedback?.blockReason || !result.response.text) {
      return NextResponse.json(
        {
          error: "Content flagged by moderation",
          categories: result.response.promptFeedback?.blockReason || "UNKNOWN",
          code: "SAFETY_BLOCK",
        },
        { status: 400 }
      );
    }

    // prepare chat context
    const contextMessages = formatContextMessages(history);
    contextMessages.push({ role: "user", content: message });
    const geminiMessages: GeminiMessage[] = contextMessages.map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    // start chat and create stream
    const chat = gaModel.startChat({
      history: geminiMessages,
      generationConfig: {
        temperature: 0.7,
      },
    });

    const resultStream = await chat.sendMessageStream(message);

    // create response stream
    return new Response(
      new ReadableStream({
        async start(controller) {
          let completeBotMessage = "";
          try {
            for await (const chunk of resultStream.stream) {
              const chunkText = chunk.text();
              if (chunkText) {
                completeBotMessage += chunkText;
                controller.enqueue(
                  `data: ${JSON.stringify({
                    choices: [{ delta: { content: chunkText } }],
                  })}\n\n`
                );
              }
            }

            // save complete bot message
            await supabase.from("ChatBot_Messages").insert({
              id: botMessageId,
              chat_session_id: sessionId,
              content: completeBotMessage,
              user_id: userId,
              is_user: false,
              model,
              created_at: botCreatedAt,
            });

            controller.close();
          } catch (error) {
            console.error("[stream error]", error);
            controller.error(error);
          }
        },
      }),
      {
        headers: {
          "Content-Type": "text/event-stream",
          Connection: "keep-alive",
          "Cache-Control": "no-cache",
        },
      }
    );
  } catch (error) {
    console.error("[gemini api error]", error);
    return NextResponse.json(
      { error: "An error occurred while processing your request" },
      { status: 500 }
    );
  }
}
