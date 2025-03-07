import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.modelName) {
      return NextResponse.json({ message: "Model name is required" }, { status: 400 });
    }

    // Log the request data
    console.log("Model Request Data:", {
      modelName: data.modelName,
      useCase: data.useCase || "Not provided",
    });

    // Here you would typically store this in a database
    // For now, we're just logging it as requested

    return NextResponse.json({ message: "Model request submitted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error processing model request:", error);
    return NextResponse.json({ message: "Failed to process request" }, { status: 500 });
  }
}
