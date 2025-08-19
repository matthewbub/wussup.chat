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

  const [unpackedMessages, userStats] = await Promise.all([
    removeStatusMessages(data?.selectedChatHistory?.history as string),
    prisma.stats.findUnique({
      where: {
        userId,
      },
    }),
  ]);
  // console.log("userStats", userStats);

  const { isOverDailyLimit } = checkMessageLimits(
    userStats?.dailyMessageCount,
    hasPaidPlan
  );
  // console.log("isOverLimit", isOverLimit);
  // Disable input when over daily limit
  const isDisabled = isOverDailyLimit;

  return (
    <ChatLifecycle
      selectedChatHistory={{
        ...(data?.selectedChatHistory as ChatHistory),
        history: unpackedMessages,
      }}
      chatHistories={data?.chatHistories as ChatHistory[]}
      isOverLimit={isOverDailyLimit}
      isDisabled={isDisabled}
      messageStats={{
        dailyCount: userStats?.dailyMessageCount || 0,
        hasPaidPlan,
      }}
    >
      <ChatApp />
    </ChatLifecycle>
  );
}
