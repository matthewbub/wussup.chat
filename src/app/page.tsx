import ChatApp from "@/components/ChatApp";
import { ChatHistory } from "@/generated/prisma";
import { getChatHistories, removeStatusMessages } from "@/lib/chatHistory";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import ChatLifecycle from "./chat/Lifecycle";
import { prisma } from "@/lib/prisma";
import { checkMessageLimits } from "@/lib/messageLimits";
import { appConfig } from "@/constants/app-config";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar";

export default async function HomePage() {
  const { userId, has } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }
  const hasPaidPlan = has({ feature: appConfig.plans.pro });

  // Generate a new chat ID for the home page
  const id = crypto.randomUUID();
  const data = await getChatHistories(userId, id);

  const [unpackedMessages, apiKey, userStats] = await Promise.all([
    removeStatusMessages(""), // Start with empty chat history
    prisma.apiKeys.findFirst({
      where: {
        userId,
      },
    }),
    prisma.stats.findUnique({
      where: {
        userId,
      },
    }),
  ]);

  const { isOverDailyLimit } = checkMessageLimits(
    userStats?.dailyMessageCount,
    hasPaidPlan
  );
  // Check if user is over limit and has no API key
  const isDisabled = isOverDailyLimit && !apiKey?.apiKey;

  return (
    <SidebarProvider className="h-full relative" defaultOpen={false}>
      <AppSidebar />
      <SidebarTrigger className="mt-4 ml-4 sticky top-0 text-muted-foreground" />
      <div className="h-full w-full">
        <ChatLifecycle
          selectedChatHistory={{
            id,
            userId,
            chatName: "New Chat",
            history: unpackedMessages,
            updatedAt: new Date(),
          }}
          chatHistories={data?.chatHistories as ChatHistory[]}
          apiKey={apiKey?.apiKey ? true : false}
          isOverLimit={isOverDailyLimit}
          isDisabled={isDisabled}
          messageStats={{
            dailyCount: userStats?.dailyMessageCount || 0,
            hasPaidPlan,
          }}
        >
          <ChatApp />
        </ChatLifecycle>
      </div>
    </SidebarProvider>
  );
}
