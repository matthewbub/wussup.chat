import { createClient } from "@supabase/supabase-js";
import { QuotaManager } from "./quota-manager";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Using service role key instead of anon key
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Create singleton instance of QuotaManager
export const quotaManager = new QuotaManager(supabase);
