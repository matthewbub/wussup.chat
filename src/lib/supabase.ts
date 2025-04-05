import { createClient } from "@supabase/supabase-js";

/**
 * this is only going to work on the server
 */
export const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON!);
