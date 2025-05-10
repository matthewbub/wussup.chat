import ChatApp from "@/components/ChatApp";
import { ChatHistory } from "@/generated/prisma";
import { getChatHistories } from "@/lib/chatHistory";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import ChatLifecycle from "./Lifecycle";

export default async function ChatPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const data = await getChatHistories(userId);

  return (
    <ChatLifecycle
      selectedChatHistory={data?.selectedChatHistory as ChatHistory}
      chatHistories={data?.chatHistories as ChatHistory[]}
    >
      <ChatApp />
    </ChatLifecycle>
  );
}
