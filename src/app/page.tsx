import ChatApp from "@/components/chat-app/chat-app";
import { subscriptionFacade } from "@/lib/subscription/init";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export default async function Home({ searchParams }: { searchParams: Promise<{ session?: string }> }) {
  const session = (await searchParams).session;
  const { userId } = await auth();

  if (!userId) {
    return <ChatApp existingData={[]} userSubscriptionInfo={null} />;
  }

  // Query for threads and the current threads messages, if applicable
  const [threads, messages] = await Promise.all([
    prisma.thread.findMany({
      where: {
        userId: userId as string,
      } satisfies Prisma.ThreadWhereInput,
      orderBy: {
        updatedAt: Prisma.SortOrder.desc,
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

  const formattedThreads = threads?.map((thread) => ({
    ...thread,
    created_at: new Date(thread.createdAt).toISOString(),
    updated_at: new Date(thread.updatedAt).toISOString(),
    chat_history: thread
      ? messages
          ?.filter((message) => message.threadId === thread.id)
          .reduce<{ role: string; content: string }[]>((acc, message) => {
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
  }));

  const userSubscriptionInfo = await subscriptionFacade.getSubscriptionStatus(userId);

  return <ChatApp existingData={formattedThreads || []} userSubscriptionInfo={userSubscriptionInfo} />;
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
