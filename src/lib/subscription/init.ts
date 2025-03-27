import { createClient } from "@supabase/supabase-js";
import { SubscriptionFacade } from "./subscription-facade";
import { quotaManager } from "../quota/init";

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

// Create singleton instance of SubscriptionFacade
export const subscriptionFacade = new SubscriptionFacade(supabase, quotaManager);
