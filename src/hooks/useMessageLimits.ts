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
      toast.error("You've reached your message limit.");
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
      toast.error("You've reached your message limit.");
      return true;
    }
    return false;
  };

  return {
    isOverLimit,
    shouldBlockAction,
    currentDailyCount: messageStats.dailyCount,
    hasPaidPlan: messageStats.hasPaidPlan,
  };
}
