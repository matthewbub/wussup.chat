import { supabase } from "@/lib/supabase";
import { SubscriptionFacade } from "./subscription-facade";
import { quotaManager } from "../quota/init";

// Create singleton instance of SubscriptionFacade
export const subscriptionFacade = new SubscriptionFacade(supabase, quotaManager);
