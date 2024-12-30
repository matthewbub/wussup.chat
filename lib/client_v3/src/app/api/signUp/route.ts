import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email, password, confirmPassword } = await req.json();

  const data = await fetch(
    "https://auth.6matbub.workers.dev/v3/public/sign-up",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, confirmPassword }),
    }
  );

  const response = await data.json();

  return NextResponse.json(response);
}
