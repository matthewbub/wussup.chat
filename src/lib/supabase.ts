import { createClient } from "@supabase/supabase-js";

/**
 * this is only going to work on the server
 */
export const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
