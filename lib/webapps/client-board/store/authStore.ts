import { create } from "zustand";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase-client";

interface AuthStore {
  user: User | null;
  client: any | null;
  teams: any[] | null;
  initialized: boolean;
  fetchUserData: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  client: null,
  teams: null,
  initialized: false,
  fetchUserData: async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      // get the client data
      const { data: clientData, error: clientError } = await supabase
        .from("Application_Clients")
        .select("*")
        .eq("created_by", user.id)
        .single();

      if (clientError) {
        console.error("Error fetching client data:", clientError);
      }

      // get the teams data
      const { data: teamData, error: teamError } = await supabase
        .from("Application_TeamMembers")
        .select("*")
        .eq("user_id", user.id);

      if (teamError) {
        console.error("Error fetching team data:", teamError);
      }

      set({ user, client: clientData, teams: teamData, initialized: true });
    } else {
      set({ user: null, client: null, teams: null, initialized: true });
    }
  },
}));
