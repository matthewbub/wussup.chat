import { AuthWrapper } from "@/components/system/AuthWrapper";
import { AuthHeader } from "@/components/system/AuthHeader";
import { Chat } from "./Chat";
import { SideNav } from "./SideNav";
import { supabase } from "@/services/supabase";

export default async function Dashboard() {
  const { data: sessions, error } = await supabase
    .from("ChatBot_Sessions")
    .select("*");

  if (error) {
    console.error(error);
  }

  return (
    <AuthWrapper>
      <div className="max-w-6xl mx-auto p-4 h-full">
        <AuthHeader />
        <div className="flex w-full">
          <SideNav sessions={sessions} />
          <div className="flex-1">
            <Chat />
          </div>
        </div>
      </div>
    </AuthWrapper>
  );
}
