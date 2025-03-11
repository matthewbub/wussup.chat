import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: Request) {
  try {
    // Get the userId from Clerk auth
    const { userId } = await auth();

    // Check if user is authenticated
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createClient();
    const data = await request.json();

    // Validate required fields
    if (!data.modelName) {
      return NextResponse.json({ message: "Model name is required" }, { status: 400 });
    }

    // Store in Supabase
    const { error } = await supabase.from("ChatBot_ModalRequestSubmissions").insert({
      modal_name: data.modelName,
      use_case: data.useCase || null,
      user_id: userId,
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
