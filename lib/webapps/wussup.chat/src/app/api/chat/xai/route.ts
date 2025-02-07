import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { formatContextMessages } from "@/lib/utils";

export async function POST(request: Request) {
  const { message, history, sessionId, model } = await request.json();
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user?.id;

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  // Increment message count at the start
  const { error: updateError } = await supabase.rpc("increment_message_count", {
    incoming_uid: userId,
    increment_by: 2,
  });

  if (updateError) {
    console.error("Failed to update message count:", updateError);
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

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Convert messages to Gemini format
    const geminiMessages = contextMessages.map((msg) => ({
      role: msg.role === "assistant" ? "model" : msg.role,
      parts: [{ text: msg.content }],
    }));

    // Initialize chat with history
    const chat = model.startChat({
      history: geminiMessages,
    });

    // Send message and get stream
    const result = await chat.sendMessageStream(message);

    // Create readable stream for response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            if (chunkText) {
              // Format response to match expected client format
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
          controller.close();
        } catch (error) {
          console.error("Stream error:", error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    return NextResponse.json({ response: error }, { status: 500 });
  }
}
