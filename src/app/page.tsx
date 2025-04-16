import ChatAppV7 from "@/components/chat-app/chat-app-v7";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { isUserSubscribed } from "@/lib/server-utils";
import { SessionWrapper } from "@/components/chat-app/session-wrapper";
import * as Sentry from "@sentry/nextjs";
import { redirect } from "next/navigation";

export default async function Home({ searchParams }: { searchParams: Promise<{ session?: string }> }) {
  const session = (await searchParams).session;
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Query for threads and the current threads messages, if applicable
  const [threads, messages] = await Promise.all([
    prisma.thread
      .findMany({
        where: {
          userId: userId as string,
        },
        orderBy: {
          updatedAt: "desc",
        },
      })
      .catch((error) => {
        Sentry.captureException(error);
        return [];
      }),
    session
      ? prisma.message
          .findMany({
            where: {
              userId: userId as string,
              threadId: session as string,
            },
          })
          .catch((error) => {
            Sentry.captureException(error);
            return null;
          })
      : null,
  ]);

  void updateUserMetadataIfNeeded(userId).catch((error) => {
    Sentry.captureException(error);
  });

  const isSubscribed = await isUserSubscribed(userId).catch((error) => {
    Sentry.captureException(error);
    return {
      isSubscribed: false,
      currentPeriodEnd: null,
      currentPeriodStart: null,
    };
  });

  const formattedThreads = threads?.map(
    (thread: { id: string; createdAt: Date; updatedAt: Date; userId: string; name: string }) => {
      try {
        return {
          ...thread,
          created_at: new Date(thread.createdAt).toISOString(),
          updated_at: new Date(thread.updatedAt).toISOString(),
          chat_history: thread ? formatMessages(messages) : [],
        };
      } catch (error) {
        Sentry.captureException(error);
        return {
          ...thread,
          created_at: new Date(thread.createdAt).toISOString(),
          updated_at: new Date(thread.updatedAt).toISOString(),
          chat_history: [],
        };
      }
    }
  );

  return (
    <SessionWrapper existingData={formattedThreads || []} isSubscribed={isSubscribed}>
      <ChatAppV7 initialMessages={formatMessages(messages || [])} />
    </SessionWrapper>
  );
}

async function updateUserMetadataIfNeeded(userId: string) {
  try {
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
  } catch (error) {
    Sentry.captureException(error);
  }
}

function formatMessages(
  messages: { id: string; input: string; output: string }[]
): { id: string; role: "user" | "assistant"; content: string }[] {
  return (
    messages?.reduce(
      (
        acc: { id: string; role: "user" | "assistant"; content: string }[],
        message: { id: string; input: string; output: string }
      ) => {
        acc.push({
          id: message.id + "-user",
          role: "user",
          content: message.input,
        });
        acc.push({
          id: message.id + "-assistant",
          role: "assistant",
          content: message.output,
        });
        return acc;
      },
      []
    ) || []
  );
}
