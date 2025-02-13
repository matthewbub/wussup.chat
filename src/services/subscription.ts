export const subscriptionService = {
  // check if user has active subscription via api endpoint
  async hasActiveSubscription(): Promise<{
    active: boolean;
    expiresAt: Date | null;
    status: string | null;
  }> {
    try {
      const response = await fetch("/api/subscription/check");
      if (!response.ok) {
        throw new Error("Failed to check subscription");
      }
      const data = await response.json();
      return {
        active: data.active,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        status: data.status,
      };
    } catch (error) {
      console.error("Subscription check failed:", error);
      return { active: false, expiresAt: null, status: null };
    }
  },
};
