import { appConfig } from "@/constants/app-config";

/**
 * Determines if a user has exceeded their message limits
 *
 * @param dailyMessageCount - The user's current daily message count
 * @param monthlyMessageCount - The user's current monthly message count
 * @param hasPaidPlan - Whether the user has a paid plan (determined by API key presence)
 * @returns Object containing limit information and status
 */
export function checkMessageLimits(
  dailyMessageCount: number | undefined | null,
  monthlyMessageCount: number | undefined | null,
  hasPaidPlan: boolean
) {
  // Determine the applicable message limits based on user's plan
  const maxDailyMessages = hasPaidPlan
    ? appConfig.rules.maxDailyMessagesOnProPlan
    : appConfig.rules.maxDailyMessagesOnFreePlan;

  // Monthly limit only applies to Pro users
  const maxMonthlyMessages = hasPaidPlan
    ? appConfig.rules.maxMonthlyMessagesOnProPlan
    : appConfig.rules.maxMonthlyMessagesOnProPlan;

  // Plan type for display purposes
  const planType = hasPaidPlan ? "Pro" : "Free";

  // Check if user has exceeded daily limit
  const isOverDailyLimit = Boolean(
    dailyMessageCount && dailyMessageCount >= maxDailyMessages
  );

  // Check if pro user has exceeded monthly limit
  const isOverMonthlyLimit =
    hasPaidPlan &&
    Boolean(monthlyMessageCount && monthlyMessageCount >= maxMonthlyMessages);

  // User is over limit if either daily or monthly limit is exceeded
  const isOverLimit = isOverDailyLimit || isOverMonthlyLimit;

  // Determine which limit was exceeded for messaging purposes
  const limitType = isOverMonthlyLimit ? "monthly" : "daily";
  const currentLimitValue = isOverMonthlyLimit
    ? maxMonthlyMessages
    : maxDailyMessages;

  return {
    maxDailyMessages,
    maxMonthlyMessages,
    planType,
    isOverLimit,
    isOverDailyLimit,
    isOverMonthlyLimit,
    limitType,
    currentLimitValue,
    currentDailyCount: dailyMessageCount || 0,
    currentMonthlyCount: monthlyMessageCount || 0,
  };
}
