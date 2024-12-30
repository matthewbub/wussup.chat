import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email, password } = await req.json();
  console.log(email, password);

  const data = await fetch("https://auth.6matbub.workers.dev/v3/public/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const response = await data.json();
  console.log(response);

  return NextResponse.json(response);
}
