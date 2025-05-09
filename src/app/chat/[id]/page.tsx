import ChatApp from "@/components/ChatApp";
import { ChatHistory } from "@/generated/prisma";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await fetch(`/api/store?id=${id}`).then(
    (res) =>
      res.json() as Promise<{
        selectedChatHistory: ChatHistory;
        chatHistories: ChatHistory[];
      }>
  );

  return (
    <ChatApp
      id={id}
      selectedChatHistory={data?.selectedChatHistory}
      chatHistories={data?.chatHistories}
    />
  );
}
