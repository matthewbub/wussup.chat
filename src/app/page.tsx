import ChatApp from "@/components/chat-app/chat-app";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { SignIn } from "@clerk/nextjs";
import { prisma } from "@/lib/prisma";
import { isUserSubscribed } from "@/lib/server-utils";
import { SessionWrapper } from "@/components/chat-app/session-wrapper";

export default async function Home({ searchParams }: { searchParams: Promise<{ session?: string }> }) {
  const session = (await searchParams).session;
  const { userId } = await auth();

  if (!userId) {
    return (
      <>
        <div className="fixed inset-0 bg-black/50 z-40" />
        <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <SignIn />
        </div>
        <ChatApp />
      </>
    );
  }

  // Query for threads and the current threads messages, if applicable
  const [threads, messages] = await Promise.all([
    prisma.thread.findMany({
      where: {
        userId: userId as string,
      },
      orderBy: {
        updatedAt: "desc",
      },
    }),
    session
      ? prisma.message.findMany({
          where: {
            userId: userId as string,
            threadId: session as string,
          },
        })
      : null,
  ]);

  void updateUserMetadataIfNeeded(userId);
  const isSubscribed = await isUserSubscribed(userId);

  const formattedThreads = threads?.map(
    (thread: { id: string; createdAt: Date; updatedAt: Date; userId: string; name: string }) => ({
      ...thread,
      created_at: new Date(thread.createdAt).toISOString(),
      updated_at: new Date(thread.updatedAt).toISOString(),
      chat_history: thread
        ? messages
            ?.filter((message: { threadId: string }) => message.threadId === thread.id)
            .reduce((acc: { role: string; content: string }[], message: { input: string; output: string }) => {
              acc.push({
                role: "user",
                content: message.input,
              });
              acc.push({
                role: "assistant",
                content: message.output,
              });
              return acc;
            }, []) || []
        : [],
    })
  );

  return (
    <SessionWrapper existingData={formattedThreads || []} isSubscribed={isSubscribed}>
      <ChatApp />
    </SessionWrapper>
  );
}

async function updateUserMetadataIfNeeded(userId: string) {
  const client = await clerkClient();

  // Fetch the user metadata
  const user = await client.users.getUser(userId);
  const metadata = user.publicMetadata || {};

  // Check and set the `last_day_reset` and `last_month_reset` if they don't exist
  const updates: { last_day_reset?: string; last_month_reset?: string } = {};
  const now = new Date().toISOString();

  if (!metadata.last_day_reset) {
    updates.last_day_reset = now;
  }

  if (!metadata.last_month_reset) {
    updates.last_month_reset = now;
  }

  // Update the user metadata if needed
  if (Object.keys(updates).length > 0) {
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        ...metadata,
        ...updates,
      },
    });
  }
}
