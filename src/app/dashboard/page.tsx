import { ChatLayout } from "@/components/DashboardLayout";
import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase-server";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    return redirect(`/`);
  }

  const user = await currentUser();
  if (!user) {
    return redirect(`/`);
  }

  const supabase = await createClient();

  // Fetch counts and token usage in parallel
  const [sessionsCount, messagesCount] = await Promise.all([
    supabase.from("ChatBot_Sessions").select("*", { count: "exact", head: true }).eq("clerk_user_id", userId),
    supabase.from("ChatBot_Messages").select("*", { count: "exact", head: true }).eq("clerk_user_id", userId),
  ]);

  return (
    <ChatLayout sessions={[]}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Welcome, {user.firstName || user.emailAddresses[0]?.emailAddress}</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-secondary p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-2">Total Chat Sessions</h2>
            <p className="text-3xl font-bold">{sessionsCount.count || 0}</p>
          </div>
          <div className="bg-secondary p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-2">Total Messages</h2>
            <p className="text-3xl font-bold">{messagesCount.count || 0}</p>
          </div>
        </div>
      </div>
    </ChatLayout>
  );
}
