interface Subscription {
  isSubscribed: boolean;
  active: boolean;
  expiresAt: Date | null;
}

export const useSubscription = () => {
  // Mock a free user (change isSubscribed to true to test premium access)
  const subscription: Subscription = {
    isSubscribed: true,
    active: true,
    expiresAt: null,
  };

  return {
    subscription,
    isLoading: false,
    error: null,
  };
};
