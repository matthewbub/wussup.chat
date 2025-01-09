import { NextResponse } from "next/server";

const CONTEXT_LENGTH = 10; // Number of previous messages to retain for context

export async function POST(request: Request) {
  const { message, history } = await request.json();

  // Retain only the last CONTEXT_LENGTH messages for context
  const contextMessages = history.slice(-CONTEXT_LENGTH).map((msg: any) => ({
    role: msg.isUser ? "user" : "assistant",
    content: msg.text,
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
        model: "gpt-3.5-turbo", // or another model you have access to
        messages: contextMessages,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Failed to fetch from OpenAI");
    }

    const chatGptResponse = data.choices[0]?.message?.content || "No response";

    return NextResponse.json({ response: chatGptResponse });
  } catch (error) {
    return NextResponse.json(
      { response: `Error: ${error.message}` },
      { status: 500 }
    );
  }
}
