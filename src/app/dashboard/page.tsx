import { ChatLayout } from "@/components/DashboardLayout";
import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase-server";
import { TokenUsageChart } from "@/components/TokenUsageChart";

interface TokenUsageData {
  model: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  created_at: string;
}

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const { userId } = await auth();

  if (!userId) {
    return redirect(`/`);
  }

  const user = await currentUser();
  if (!user) {
    return redirect(`/`);
  }

  const timeFilter = typeof searchParams.timeFilter === "string" ? searchParams.timeFilter : "all";

  const supabase = await createClient();

  // Fetch counts and token usage in parallel
  const [sessionsCount, messagesCount, tokenUsage] = await Promise.all([
    supabase.from("ChatBot_Sessions").select("*", { count: "exact", head: true }).eq("clerk_user_id", userId),
    supabase.from("ChatBot_Messages").select("*", { count: "exact", head: true }).eq("clerk_user_id", userId),
    supabase
      .from("ChatBot_Messages")
      .select("model, model_provider, prompt_tokens, completion_tokens, created_at")
      .eq("clerk_user_id", userId)
      .not("model", "is", null),
  ]);

  // Process token usage data
  const modelTokenUsage = tokenUsage.data?.reduce((acc: Record<string, TokenUsageData>, msg) => {
    const modelKey = `${msg.model_provider}/${msg.model}`;
    if (!acc[modelKey]) {
      acc[modelKey] = {
        model: modelKey,
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0,
        created_at: msg.created_at,
      };
    }
    acc[modelKey].prompt_tokens += msg.prompt_tokens || 0;
    acc[modelKey].completion_tokens += msg.completion_tokens || 0;
    acc[modelKey].total_tokens += (msg.prompt_tokens || 0) + (msg.completion_tokens || 0);
    return acc;
  }, {});

  const chartData = modelTokenUsage ? Object.values(modelTokenUsage) : [];

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

        <div className="bg-secondary p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Token Usage by Model</h2>
          <TokenUsageChart data={chartData} initialTimeFilter={timeFilter} />
        </div>
      </div>
    </ChatLayout>
  );
}
