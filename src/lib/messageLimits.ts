import { appConfig } from "@/constants/app-config";
import { prisma } from "@/lib/prisma";

/**
 * Checks if a new day has started and resets daily message count if needed
 *
 * @param userId - The user's ID
 * @returns The updated daily message count
 */
export async function ensureDailyReset(userId: string): Promise<number> {
  const userStats = await prisma.stats.findUnique({
    where: { userId },
  });

  if (!userStats) {
    // Create new stats record if it doesn't exist
    await prisma.stats.create({
      data: {
        userId,
        dailyMessageCount: 0,
        dailyResetDate: new Date(),
        lifetimeMessageCount: 0,
      },
    });
    return 0;
  }

  const today = new Date();
  const resetDate = userStats.dailyResetDate;

  // Check if it's a new day (comparing date parts only)
  const isNewDay =
    today.getFullYear() !== resetDate.getFullYear() ||
    today.getMonth() !== resetDate.getMonth() ||
    today.getDate() !== resetDate.getDate();

  if (isNewDay) {
    // Reset daily count and update reset date
    await prisma.stats.update({
      where: { userId },
      data: {
        dailyMessageCount: 0,
        dailyResetDate: new Date(),
      },
    });

    // Log the reset
    await prisma.logs.create({
      data: {
        userId,
        message: "[AUTO] Daily message count reset - new day detected",
      },
    });

    return 0;
  }

  return userStats.dailyMessageCount;
}

/**
 * Determines if a user has exceeded their message limits
 *
 * @param dailyMessageCount - The user's current daily message count
 * @param hasPaidPlan - Whether the user has a paid plan (determined by API key presence)
 * @returns Object containing limit information and status
 */
export function checkMessageLimits(
  dailyMessageCount: number | undefined | null,
  hasPaidPlan: boolean
) {
  // Determine the applicable message limits based on user's plan
  const maxDailyMessages = hasPaidPlan
    ? appConfig.rules.maxDailyMessagesOnProPlan
    : appConfig.rules.maxDailyMessagesOnFreePlan;

  // Check if user has exceeded daily limit
  const isOverDailyLimit = Boolean(
    dailyMessageCount && dailyMessageCount >= maxDailyMessages
  );

  return {
    maxDailyMessages,
    isOverDailyLimit,
    currentDailyCount: dailyMessageCount || 0,
  };
}
