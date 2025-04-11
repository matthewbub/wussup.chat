import ChatApp from "@/components/chat-app/chat-app";
import { subscriptionFacade } from "@/lib/subscription/init";
import * as Sentry from "@sentry/nextjs";
import { formatChatHistory } from "@/lib/format/format-utils";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

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
        userId: userId,
      },
      orderBy: {
        updatedAt: "desc",
      },
    }),
    session
      ? prisma.message.findMany({
          where: {
            userId: userId,
            threadId: session,
          },
        })
      : null,
  ]);

  void updateUserMetadataIfNeeded(userId);

  const formattedThreads = threads?.map((thread) => ({
    ...thread,
    created_at: new Date(thread.createdAt).toISOString(),
    updated_at: new Date(thread.updatedAt).toISOString(),
    chat_history: thread ? formatChatHistory(messages?.filter((message) => message.threadId === thread.id) || []) : [],
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
