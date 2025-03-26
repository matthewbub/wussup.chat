import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { history } = await request.json();

  return NextResponse.json({ history });
}
