import * as Sentry from "@sentry/nextjs";

/**
 * Helper functions for working with subscriptions consistently across the app
 */

/**
 * Valid price IDs used throughout the application
 * This ensures we have a single source of truth for valid price IDs
 */
export const validPriceIds = [process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_FOR__PRO_PLAN_ALPHA_ONE_MONTH_RECURRING];

/**
 * Check if a given price ID is valid
 * @param priceId - The price ID to validate
 * @returns Boolean indicating if the price ID is valid
 */
export function isPriceIdValid(priceId: string | null | undefined): boolean {
  if (!priceId) return false;
  return validPriceIds.includes(priceId);
}

/**
 * Determine if a price ID is for a recurring subscription
 * @param priceId - The price ID to check
 * @returns Boolean indicating if the price ID is for a recurring subscription
 */
export function isRecurringSubscription(priceId: string | null | undefined): boolean {
  if (!priceId) return false;
  return priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_FOR__PRO_PLAN_ALPHA_ONE_MONTH_RECURRING;
}

/**
 * Get the duration in days for a given price ID
 * @param priceId - The price ID to get duration for
 * @returns The duration in days, or 30 days as fallback
 */
export function getDurationForPriceId(priceId: string | null | undefined): number {
  if (!priceId) return 30;

  switch (priceId) {
    case process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_FOR__PRO_PLAN_ALPHA_ONE_MONTH:
    case process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_FOR__PRO_PLAN_ALPHA_ONE_MONTH_RECURRING:
      return 30;
    case process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_FOR__PRO_PLAN_ALPHA_THREE_MONTHS:
      return 90;
    case process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_FOR__PRO_PLAN_ALPHA_TWELVE_MONTHS:
      return 365;
    default:
      return 30;
  }
}

/**
 * Calculate subscription end date based on price ID and start date
 * @param priceId - The price ID to calculate for
 * @param startDate - The start date (defaults to now)
 * @returns The calculated end date
 */
export function calculateSubscriptionEndDate(priceId: string | null | undefined, startDate: Date = new Date()): Date {
  const durationInDays = getDurationForPriceId(priceId);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + durationInDays);
  return endDate;
}

/**
 * Safely handle errors with Sentry capture
 * @param error - The error to handle
 * @param context - Optional context about where the error occurred
 */
export function handleSubscriptionError(error: unknown, context: string = "subscription"): void {
  console.error(`[${context}] Error:`, error);
  Sentry.captureException(error);
}

/**
 * Get payment type based on price ID
 * @param priceId - The price ID to check
 * @returns "recurring" for recurring subscriptions, "one-time" for one-time payments
 */
export function getPaymentTypeFromPriceId(priceId: string | null | undefined): "recurring" | "one-time" {
  return isRecurringSubscription(priceId) ? "recurring" : "one-time";
}
