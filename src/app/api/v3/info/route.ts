import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { userId } = await auth();

  const body = await request.json();

  const { message } = body;

  return NextResponse.json({
    userId,
    message,
  });
}
