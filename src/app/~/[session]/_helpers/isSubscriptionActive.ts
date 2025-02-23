export const isSubscriptionActive = (subscriptionEndDate: string) => {
  return subscriptionEndDate ? new Date(subscriptionEndDate) > new Date() : false;
};
