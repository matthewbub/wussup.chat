"use client";

import { useEffect, useState } from "react";
import { useSubscriptionStore } from "@/stores/useSubscription";
import { useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import Confetti from "@/components/ui/Confetti";

export function BillingSettings() {
  const [isLoading, setIsLoading] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const { subscription } = useSubscriptionStore();
  const { toast } = useToast();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("success")) {
      setConfetti(true);
      toast({
        title: "Subscription Started",
        description:
          "Thank you for subscribing! Your account has been upgraded.",
        variant: "default",
      });

      setTimeout(() => {
        setConfetti(false);
      }, 5000);
    } else if (searchParams.get("canceled")) {
      toast({
        title: "Subscription Canceled",
        description:
          "The subscription process was canceled. No charges were made.",
        variant: "destructive",
      });
    }
  }, [searchParams, toast]);

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        "/api/subscription/create-checkout-session",
        {
          method: "POST",
        }
      );
      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error(
        "[BillingSettings] Failed to create checkout session:",
        error
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setIsLoading(true);
    try {
      // Create Stripe customer portal session
      const response = await fetch("/api/subscription/create-portal-session");
      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error("[BillingSettings] Failed to open customer portal:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const isPro = subscription.active;

  return (
    <>
      <h2 className="text-xl font-bold mb-6 dark:text-white">
        Billing Settings
      </h2>

      {/* Current Plan Status */}
      <div className="mb-8">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-medium dark:text-gray-200 mb-2">
            Current Plan
          </h3>
          {isPro ? (
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                You are currently subscribed to the Pro plan.
              </p>
              {subscription.expiresAt && (
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Next billing date:{" "}
                  {subscription.expiresAt.toLocaleDateString()}
                </p>
              )}
              <button
                onClick={handleManageSubscription}
                disabled={isLoading}
                className="mt-4 px-4 py-2 text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400 rounded-md hover:bg-blue-50 dark:hover:bg-blue-950"
              >
                {isLoading ? "Loading..." : "Manage Subscription"}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                You are currently on the free plan.
              </p>

              {/* Pro Plan Card */}
              <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4">
                <h4 className="text-lg font-medium dark:text-gray-200 mb-2">
                  Pro Plan
                </h4>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  $9
                  <span className="text-base font-normal text-gray-600 dark:text-gray-400">
                    /month
                  </span>
                </p>
                <ul className="space-y-2 mb-4">
                  <li className="text-sm text-gray-600 dark:text-gray-300 flex items-center">
                    <svg
                      className="w-4 h-4 mr-2 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Unlimited AI chat conversations
                  </li>
                  <li className="text-sm text-gray-600 dark:text-gray-300 flex items-center">
                    <svg
                      className="w-4 h-4 mr-2 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Unlimited Document Storage for Contextual AI
                  </li>
                  <li className="text-sm text-gray-600 dark:text-gray-300 flex items-center">
                    <svg
                      className="w-4 h-4 mr-2 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Anonymous AI Chat
                  </li>
                  <li className="text-sm text-gray-600 dark:text-gray-300 flex items-center">
                    <svg
                      className="w-4 h-4 mr-2 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Much more!
                  </li>
                </ul>
                <button
                  onClick={handleSubscribe}
                  disabled={isLoading}
                  className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-700 dark:hover:bg-blue-800"
                >
                  {isLoading ? "Loading..." : "Upgrade to Pro"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Confetti trigger={confetti} />
    </>
  );
}
