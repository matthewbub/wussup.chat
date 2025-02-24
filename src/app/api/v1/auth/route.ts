import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();

  try {
    const { email, password, mode, provider } = await request.json();

    if (provider === "github") {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
      const { error, data } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${baseUrl}/auth/confirm`,
        },
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ url: data.url }, { status: 200 });
    } else {
      const { data, error } =
        mode === "login"
          ? await supabase.auth.signInWithPassword({ email, password })
          : await supabase.auth.signUp({ email, password });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ user: data.user }, { status: 200 });
    }
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as { message: string }).message }, { status: 500 });
  }
}
