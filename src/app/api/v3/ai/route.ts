import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId } = await auth();

  // this is confusing cause its a rewrite

  return NextResponse.json({
    userId,
    chatHistory: {
      // ...
    },
  });
}
