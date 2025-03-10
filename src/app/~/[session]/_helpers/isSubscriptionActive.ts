// checks if a subscription is active by comparing the end date with current date
// returns true if subscription end date is in the future, false otherwise
export const isSubscriptionActive = (subscriptionEndDate: string) => {
  return subscriptionEndDate ? new Date(subscriptionEndDate) > new Date() : false;
};
