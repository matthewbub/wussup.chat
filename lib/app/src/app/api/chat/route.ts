import { NextResponse } from "next/server";

const CONTEXT_LENGTH = 10; // Number of previous messages to retain for context

export async function POST(request: Request) {
  const { message, history } = await request.json();

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
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: contextMessages,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error?.message || "Failed to fetch from OpenAI"
      );
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder("utf-8");

    const stream = new ReadableStream({
      async start(controller) {
        let done = false;

        while (!done) {
          // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
          const { value, done: doneReading } = await reader?.read()!;
          done = doneReading;
          const chunk = decoder.decode(value, { stream: true });

          // Process each line of the chunk
          const lines = chunk.split("\n").filter((line) => line.trim() !== "");
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const json = line.substring(6);
              try {
                const parsed = JSON.parse(json);
                const content = parsed.choices[0]?.delta?.content || "";
                controller.enqueue(content);
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
