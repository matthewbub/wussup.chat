import ChatApp from "@/components/ChatApp";
import { ChatHistory } from "@/generated/prisma";
import { getChatHistories } from "@/lib/chatHistory";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import ChatLifecycle from "../Lifecycle";
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

  return (
    <ChatLifecycle
      selectedChatHistory={data?.selectedChatHistory as ChatHistory}
      chatHistories={data?.chatHistories as ChatHistory[]}
    >
      <ChatApp />
    </ChatLifecycle>
  );
}
