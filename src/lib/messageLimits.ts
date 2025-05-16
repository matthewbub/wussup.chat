import { appConfig } from "@/constants/app-config";

/**
 * Determines if a user has exceeded their daily message limit
 *
 * @param dailyMessageCount - The user's current daily message count
 * @param hasPaidPlan - Whether the user has a paid plan (determined by API key presence)
 * @returns Object containing limit information and status
 */
export function checkMessageLimits(
  dailyMessageCount: number | undefined | null,
  hasPaidPlan: boolean
) {
  // Determine the applicable message limit based on user's plan
  const maxMessages = hasPaidPlan
    ? appConfig.rules.maxDailyMessagesOnProPlan
    : appConfig.rules.maxDailyMessagesOnFreePlan;

  // Plan type for display purposes
  const planType = hasPaidPlan ? "Pro" : "Free";

  // If user has no stats yet or count is below limit, they can chat
  const isOverLimit = Boolean(
    dailyMessageCount && dailyMessageCount >= maxMessages
  );

  return {
    maxMessages,
    planType,
    isOverLimit,
    currentCount: dailyMessageCount || 0,
  };
}
