import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { apiKey, provider, expiresAt } = await request.json();

  return NextResponse.json({ apiKey, provider, expiresAt });
}
