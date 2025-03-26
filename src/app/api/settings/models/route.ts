import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { model, provider, enabled } = await request.json();

  return NextResponse.json({ model, provider, enabled });
}
