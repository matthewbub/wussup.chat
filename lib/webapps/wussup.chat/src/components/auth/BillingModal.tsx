"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState } from "react";
import { useSubscriptionStore } from "@/stores/useSubscription";
import Confetti from "@/components/ui/Confetti";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2 } from "lucide-react";

interface BillingModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
}

export function BillingModal({ isOpen, onClose, userId }: BillingModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const { subscription } = useSubscriptionStore();
  // const { toast } = useToast();

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
      console.error("[BillingModal] Failed to create checkout session:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/subscription/manage?userId=${userId}`);
      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error("[BillingModal] Failed to open customer portal:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const isPro = subscription.active;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <div className="grid gap-6">
          <div>
            <h2 className="text-lg font-semibold">Billing Settings</h2>
            <p className="text-sm text-muted-foreground">
              Manage your subscription and billing preferences.
            </p>
          </div>

          {/* Rest of the billing content */}
          <div className="grid gap-4">
            {isPro ? (
              <div className="space-y-4">
                {/* Subscription status alerts */}
                {subscription.status === "active" && (
                  <Alert>
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertTitle>Pro Plan Active</AlertTitle>
                    <AlertDescription>
                      Next billing date:{" "}
                      {subscription.expiresAt?.toLocaleDateString()}
                    </AlertDescription>
                  </Alert>
                )}
                {/* Add other status alerts here */}

                <Button
                  variant="outline"
                  onClick={handleManageSubscription}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : subscription.status === "canceled" ? (
                    "Reactivate Subscription"
                  ) : (
                    "Manage Subscription"
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  You are currently on the free plan.
                </p>

                <Card className="p-6">
                  <div className="space-y-4">
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
                        "Conversations with models from OpenAI, Anthropic, and xAI",
                        "Unlimited document storage for contextual AI",
                        "Anonymous AI chat, fork conversations, and much more",
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
                </Card>
              </div>
            )}
          </div>
        </div>
        <Confetti trigger={confetti} />
      </DialogContent>
    </Dialog>
  );
}
