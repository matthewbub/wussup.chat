import ChatApp from "@/components/ChatApp";
import { ChatHistory } from "@/generated/prisma";
import { getChatHistories, removeStatusMessages } from "@/lib/chatHistory";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import ChatLifecycle from "../Lifecycle";
import { prisma } from "@/lib/prisma";
import { checkMessageLimits } from "@/lib/messageLimits";
import { appConfig } from "@/constants/app-config";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId, has } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }
  const hasPaidPlan = has({ feature: appConfig.plans.pro });

  const { id } = await params;
  const data = await getChatHistories(userId, id);

  const [unpackedMessages, apiKey, userStats] = await Promise.all([
    removeStatusMessages(data?.selectedChatHistory?.history as string),
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

  const { isOverLimit } = checkMessageLimits(
    userStats?.dailyMessageCount,
    userStats?.monthlyMessageCount,
    hasPaidPlan
  );

  // Check if user is over limit and has no API key
  const isDisabled = isOverLimit && !apiKey?.apiKey;

  return (
    <ChatLifecycle
      selectedChatHistory={{
        ...(data?.selectedChatHistory as ChatHistory),
        history: unpackedMessages,
      }}
      chatHistories={data?.chatHistories as ChatHistory[]}
      apiKey={apiKey?.apiKey ? true : false}
      isOverLimit={isOverLimit}
      isDisabled={isDisabled}
      messageStats={{
        dailyCount: userStats?.dailyMessageCount || 0,
        monthlyCount: userStats?.monthlyMessageCount || 0,
        hasPaidPlan,
      }}
    >
      <ChatApp />
    </ChatLifecycle>
  );
}
