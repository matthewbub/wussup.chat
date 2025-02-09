import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { chatModels } from "@/constants/models";

export async function POST(request: Request) {
  const { messages } = await request.json();
  const supabase = await createClient();

  // get current user from request context
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user?.id;

  if (!userId) {
    return NextResponse.json({ error: "user id is required" }, { status: 400 });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({
      model: chatModels.gemini[0].id,
    });

    // Convert messages to Gemini format and add system prompt
    const prompt =
      "Generate a short, engaging title (max 6 words) for this chat conversation in plain text.\n\nChat history:\n" +
      messages
        .map(
          (m: { content: string; role: string }) => `${m.role}: ${m.content}`
        )
        .join("\n");

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const title = response.text().trim() || "New Chat";

    return NextResponse.json({ title });
  } catch (error) {
    console.error("error generating title:", error);
    return NextResponse.json(
      { error: "Failed to generate title" },
      { status: 500 }
    );
  }
}
