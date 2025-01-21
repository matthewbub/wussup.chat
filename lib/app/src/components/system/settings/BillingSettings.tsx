"use client";

import { useEffect, useState } from "react";
import { useSubscriptionStore } from "@/stores/useSubscription";
import { useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import Confetti from "@/components/ui/Confetti";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Check, Loader2 } from "lucide-react";

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
    <div className="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-3">
      <div className="px-4 sm:px-0">
        <h2 className="text-base font-semibold">Billing Settings</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your subscription and billing preferences.
        </p>
      </div>

      <Card className="md:col-span-2">
        <div className="px-4 py-6 sm:p-8">
          <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8">
            {/* Current Plan Status */}
            <div className="col-span-full">
              <h3 className="text-lg font-medium mb-4">Current Plan</h3>
              {isPro ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-x-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Pro Plan Active</span>
                  </div>
                  {subscription.expiresAt && (
                    <p className="text-sm text-muted-foreground">
                      Next billing date:{" "}
                      {subscription.expiresAt.toLocaleDateString()}
                    </p>
                  )}
                  <Button
                    variant="outline"
                    onClick={handleManageSubscription}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      "Manage Subscription"
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <p className="text-sm text-muted-foreground">
                    You are currently on the free plan.
                  </p>

                  {/* Pro Plan Card */}
                  <div className="rounded-lg border p-6 space-y-4">
                    <div className="space-y-2">
                      <h4 className="text-lg font-medium">Pro Plan</h4>
                      <div className="flex items-baseline">
                        <span className="text-3xl font-bold">$9</span>
                        <span className="text-sm text-muted-foreground ml-1">
                          /month
                        </span>
                      </div>
                    </div>

                    <ul className="space-y-2">
                      {[
                        "Unlimited AI chat conversations",
                        "Unlimited Document Storage for Contextual AI",
                        "Anonymous AI Chat",
                        "Much more!",
                      ].map((feature, index) => (
                        <li key={index} className="flex items-center gap-x-2">
                          <Check className="h-4 w-4 text-green-500" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      className="w-full"
                      onClick={handleSubscribe}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        "Upgrade to Pro"
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      <Confetti trigger={confetti} />
    </div>
  );
}
