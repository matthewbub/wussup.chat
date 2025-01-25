import { NextResponse } from "next/server";
import { supabase } from "@/services/supabase";
import { promptFacade } from "@/services/promptFacade";
import { AVAILABLE_MODELS as models } from "@/app/chat/ModelSelect";

const CONTEXT_LENGTH = 100; // Number of previous messages to retain for context
const TITLE_SYSTEM_PROMPT =
  "Summarize the following message as a brief, engaging title in 4-6 words:";

export async function POST(request: Request) {
  const { message, history, userId, sessionId, model } = await request.json();

  // find provider / model
  const provider = models.find((m) => m.id === model)?.provider;
  if (!provider) throw new Error("Invalid model");
  promptFacade.setProvider(provider);

  let title = "";
  // Check if this is the first message

  if (history.length === 2) {
    // Generate title first
    const createTitleResponseData = await promptFacade.prompt(
      [
        { role: "system", content: TITLE_SYSTEM_PROMPT },
        { role: "user", content: message },
      ],
      model,
      { stream: false }
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

    const { error } = await supabase
      .from("ChatBot_Sessions")
      .update({ name: titleString })
      .eq("id", sessionId)
      .eq("user_id", userId)
      .select();

    if (error) {
      throw new Error("Failed to update session title");
    }

    title = titleString;
  }

  // Filter out empty messages and deduplicate
  const contextMessages = history
    .slice(-CONTEXT_LENGTH)
    .filter(
      (msg: { is_user: boolean; content: string }) => msg.content.trim() !== ""
    )
    .map((msg: { is_user: boolean; content: string }) => ({
      role: msg.is_user ? "user" : "assistant",
      content: msg.content,
    }));

  // Add the new message to the context
  contextMessages.push({ role: "user", content: message });

  try {
    const response: Response = await promptFacade.prompt(
      contextMessages,
      model,
      {
        stream: true,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.log("errorData", errorData);
      throw new Error(
        errorData.error?.message || "Failed to fetch from OpenAI"
      );
    }

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
