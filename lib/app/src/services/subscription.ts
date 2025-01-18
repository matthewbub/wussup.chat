export const subscriptionService = {
  // check if user has active subscription via api endpoint
  async hasActiveSubscription(userId: string): Promise<{
    active: boolean;
    expiresAt: Date | null;
  }> {
    try {
      const response = await fetch("/api/subscription/check?userId=" + userId);
      if (!response.ok) {
        throw new Error("Failed to check subscription");
      }
      const data = await response.json();
      return {
        active: data.active,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      };
    } catch (error) {
      console.error("Subscription check failed:", error);
      return { active: false, expiresAt: null };
    }
  },
};
