import { appConfig } from "@/constants/app-config";

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
