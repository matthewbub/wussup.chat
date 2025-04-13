"use client";

import { Button } from "@/components/ui/button";
import { Card, CardTitle, CardHeader, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { useState } from "react";

export default function SubscriptionSettings({
  isSubscribed,
  currentPeriodEnd,
  currentPeriodStart,
  cancelAtPeriodEnd,
}: {
  isSubscribed: boolean;
  currentPeriodEnd: Date | null;
  currentPeriodStart: Date | null;
  cancelAtPeriodEnd: boolean;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCancel = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/subscription/cancel", {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to cancel subscription");
      }

      // Refresh the page to show updated subscription status
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel subscription");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/subscription/upgrade", {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to upgrade subscription");
      }

      // Refresh the page to show updated subscription status
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upgrade subscription");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto py-8 w-full">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Subscription Status</CardTitle>
          <CardDescription>{isSubscribed ? "Active" : "Inactive"}</CardDescription>
        </CardHeader>
        <CardContent>
          {isSubscribed ? (
            <div className="border-t pt-6">
              <dl className="space-y-4">
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">Billing Period</dt>
                  <dd className="text-sm text-gray-900 dark:text-gray-100">
                    {currentPeriodStart?.toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}{" "}
                    -{" "}
                    {currentPeriodEnd?.toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </dd>
                </div>
                {!cancelAtPeriodEnd && (
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">Next Payment</dt>
                    <dd className="text-sm text-gray-900 dark:text-gray-100">
                      {currentPeriodEnd?.toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </dd>
                  </div>
                )}
              </dl>
              {cancelAtPeriodEnd && (
                <p className="text-sm text-red-500 dark:text-red-600 mt-4 text-right">
                  Your subscription will end on{" "}
                  {currentPeriodEnd?.toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              )}
            </div>
          ) : (
            <div>
              <p>You are not subscribed to any plan.</p>
            </div>
          )}
        </CardContent>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">{error}</div>
        )}

        <CardFooter>
          {isSubscribed && !cancelAtPeriodEnd ? (
            <Button onClick={handleCancel} disabled={isLoading}>
              {isLoading ? "Canceling..." : "Cancel Subscription"}
            </Button>
          ) : (
            <Button disabled={isLoading} onClick={handleUpgrade}>
              {isLoading ? "Upgrading..." : "Upgrade to Pro"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
