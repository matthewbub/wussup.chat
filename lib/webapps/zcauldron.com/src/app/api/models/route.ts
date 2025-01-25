import { NextResponse } from "next/server";

export async function GET() {
  const response = await fetch("https://api.openai.com/v1/models", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
  });

  const data = await response.json();
  return NextResponse.json(data);
}
