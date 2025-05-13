import ChatApp from "@/components/ChatApp";
import { ChatHistory } from "@/generated/prisma";
import { getChatHistories, removeStatusMessages } from "@/lib/chatHistory";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import ChatLifecycle from "../Lifecycle";
import { prisma } from "@/lib/prisma";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const { id } = await params;
  const data = await getChatHistories(userId, id);

  const [unpackedMessages, apiKey] = await Promise.all([
    removeStatusMessages(data?.selectedChatHistory?.history as string),
    prisma.apiKeys.findFirst({
      where: {
        userId,
      },
    }),
  ]);

  return (
    <ChatLifecycle
      selectedChatHistory={{
        ...(data?.selectedChatHistory as ChatHistory),
        history: unpackedMessages,
      }}
      chatHistories={data?.chatHistories as ChatHistory[]}
      apiKey={apiKey?.apiKey ? true : false}
    >
      <ChatApp />
    </ChatLifecycle>
  );
}
