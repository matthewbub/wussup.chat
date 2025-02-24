import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@/lib/supabase-server";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { email, password, mode, provider } = req.body;
  const supabase = await createClient();

  try {
    if (provider === "github") {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
      const { error, data } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${baseUrl}/auth/confirm`,
        },
      });

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(200).json({ url: data.url });
    } else {
      const { data, error } =
        mode === "login"
          ? await supabase.auth.signInWithPassword({ email, password })
          : await supabase.auth.signUp({ email, password });

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(200).json({ user: data.user });
    }
  } catch (err: unknown) {
    return res.status(500).json({ error: (err as { message: string }).message });
  }
}
