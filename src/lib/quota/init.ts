import { supabase } from "@/lib/supabase";
import { QuotaManager } from "./quota-manager";

// Create singleton instance of QuotaManager
export const quotaManager = new QuotaManager(supabase);
