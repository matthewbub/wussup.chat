import { createClient } from "@/lib/supabase-server";
import { Client } from "./_components/Client";

export default async function Page() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getSession();
  return <Client isLoggedIn={!!data?.session} />;
}
