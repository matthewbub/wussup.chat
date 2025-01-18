import { NextResponse } from "next/server";
import { supabase } from "@/services/supabase";
const CONTEXT_LENGTH = 100; // Number of previous messages to retain for context
const TITLE_SYSTEM_PROMPT =
  "Summarize the following message as a brief, engaging title in 4-6 words:";
const OPENAI_BASE_URL = "https://api.openai.com/v1/chat/completions";
const XAI_BASE_URL = "https://api.x.ai/v1/chat/completions";

function getApiConfig(model: string) {
  const isXAI = model?.toLowerCase().includes("grok");
  return {
    baseUrl: isXAI ? XAI_BASE_URL : OPENAI_BASE_URL,
    apiKey: isXAI ? process.env.GROK_API_KEY : process.env.OPENAI_API_KEY,
    authPrefix: "Bearer",
    defaultModel: isXAI ? "grok-2-latest" : "gpt-4-turbo-2024-04-09",
  };
}

export async function POST(request: Request) {
  const { message, history, userId, sessionId, model } = await request.json();

  let title = "";
  // Check if this is the first message
  if (history.length === 2) {
    // Generate title first
    const createTitleResponseData = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: TITLE_SYSTEM_PROMPT },
            { role: "user", content: message },
          ],
          temperature: 0.7,
          stream: false,
        }),
      }
    );

    if (!createTitleResponseData.ok) {
      throw new Error("Failed to generate title");
    }

    const createTitleResponseDataParsed = await createTitleResponseData.json();
    // this returns a string inside a string, plz fix
    const unsafeTitle =
      createTitleResponseDataParsed.choices[0].message.content.trim();

    // remove the string inside the string
    const titleString = unsafeTitle.replace(/^"(.+)"$/, "$1");

    const { data, error } = await supabase
      .from("ChatBot_Sessions")
      .update({ name: titleString })
      .eq("id", sessionId)
      .eq("user_id", userId)
      .select();

    if (error) {
      throw new Error("Failed to update session title");
    }

    title = titleString;
    console.log("title", titleString, data);
  }

  // Retain only the last CONTEXT_LENGTH messages for context
  const contextMessages = history
    .slice(-CONTEXT_LENGTH)
    .map((msg: { is_user: boolean; content: string }) => ({
      role: msg.is_user ? "user" : "assistant",
      content: msg.content,
    }));

  // Add the new message to the context
  contextMessages.push({ role: "user", content: message });

  try {
    const apiConfig = getApiConfig(model);
    console.log("apiConfig", apiConfig);
    const response = await fetch(apiConfig.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${apiConfig.authPrefix} ${apiConfig.apiKey}`,
      },
      body: JSON.stringify({
        model: apiConfig.defaultModel,
        messages: [
          {
            role: "system",
            content:
              "You are Grok, a chatbot inspired by the Hitchhikers Guide to the Galaxy.",
          },
          ...contextMessages,
        ],
        stream: true,
        temperature: 0.7,
      }),
    });
    console.log("response", response);
    if (!response.ok) {
      const errorData = await response.json();
      console.log("errorData", errorData);
      throw new Error(
        errorData.error?.message || "Failed to fetch from OpenAI"
      );
    }

    console.log("response", response);
    const reader = response.body?.getReader();
    const decoder = new TextDecoder("utf-8");

    const stream = new ReadableStream({
      async start(controller) {
        // Send title update as first chunk if this was a title generation
        if (history.length === 2 && title) {
          const titleUpdate = JSON.stringify({
            type: "title_update",
            title: title,
            sessionId,
          });
          controller.enqueue(`data: ${titleUpdate}\n\n`);
        }

        let done = false;
        while (!done) {
          // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
          const { value, done: doneReading } = await reader?.read()!;
          done = doneReading;
          const chunk = decoder.decode(value, { stream: true });

          // Process each line of the chunk
          const lines = chunk.split("\n").filter((line) => line.trim() !== "");
          for (const line of lines) {
            if (line.includes("[DONE]")) {
              continue;
            }

            if (line.startsWith("data: ")) {
              const json = line.substring(6);
              try {
                // Skip empty data lines
                if (!json.trim()) continue;

                const parsed = JSON.parse(json);
                if (parsed.choices?.[0]?.delta?.content) {
                  controller.enqueue(`data: ${JSON.stringify(parsed)}\n\n`);
                }
              } catch (error) {
                console.error("Error parsing JSON:", error);
              }
            }
          }
        }

        controller.close();
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    return NextResponse.json({ response: error }, { status: 500 });
  }
}

// get chat sessions and messages for a user
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    const [sessionsResult, messagesResult] = await Promise.all([
      supabase.from("ChatBot_Sessions").select("*").eq("user_id", userId),
      supabase.from("ChatBot_Messages").select("*").eq("user_id", userId),
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
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
