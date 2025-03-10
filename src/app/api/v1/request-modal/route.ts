import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const data = await request.json();

    // Get the user session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Validate required fields
    if (!data.modelName) {
      return NextResponse.json({ message: "Model name is required" }, { status: 400 });
    }

    // Store in Supabase
    const { error } = await supabase.from("ChatBot_ModalRequestSubmissions").insert({
      modal_name: data.modelName,
      use_case: data.useCase || null,
      user_id: session.user.id,
    });

    if (error) {
      console.error("Error storing modal request:", error);
      return NextResponse.json({ message: "Failed to store request" }, { status: 500 });
    }

    return NextResponse.json({ message: "Model request submitted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error processing model request:", error);
    return NextResponse.json({ message: "Failed to process request" }, { status: 500 });
  }
}
