"use client";
import { useEffect } from "react";
import { toast } from "sonner";
import { useChatStore } from "@/app/chat/Lifecycle";
import { checkMessageLimits } from "@/lib/messageLimits";

/**
 * Hook to handle message limit notifications and status
 *
 * @returns Object with limit information and utility functions
 */
export function useMessageLimits() {
  const { isOverLimit, apiKey, messageStats } = useChatStore();

  // Show notification when user exceeds their message limit
  useEffect(() => {
    if (isOverLimit) {
      const { maxMessages, planType } = checkMessageLimits(
        messageStats.dailyCount,
        messageStats.hasPaidPlan
      );

      toast.error(
        `You've reached your daily message limit (${maxMessages}) for the ${planType} plan.`
      );
    }
  }, [isOverLimit, messageStats]);

  /**
   * Check if an action should be blocked due to message limits
   * Shows a toast notification if needed
   *
   * @returns boolean - true if action should be blocked
   */
  const shouldBlockAction = () => {
    if (isOverLimit) {
      const { maxMessages, planType } = checkMessageLimits(
        messageStats.dailyCount,
        messageStats.hasPaidPlan
      );

      toast.error(
        `You've reached your daily message limit (${maxMessages}) for the ${planType} plan.`
      );
      return true;
    }
    return false;
  };

  return {
    isOverLimit,
    shouldBlockAction,
    currentCount: messageStats.dailyCount,
    hasPaidPlan: messageStats.hasPaidPlan,
  };
}
