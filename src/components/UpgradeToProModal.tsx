"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { features, plan } from "@/constants/app-config";

interface UpgradeToProModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UpgradeToProModal({ open, onOpenChange }: UpgradeToProModalProps) {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async () => {
    if (!plan.priceId) {
      console.error("No price ID found for plan");
      return;
    }

    if (!isSignedIn) {
      router.push("/sign-in?redirect_url=/pricing");
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch("/api/subscription/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ priceId: plan.priceId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upgrade to Pro</DialogTitle>
          <DialogDescription>Get access to all models and increased chat limits with our Pro plan.</DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{plan.price}</span>
              <span className="text-sm text-muted-foreground line-through">{plan.originalPrice}</span>
            </div>
            <div className="text-sm text-muted-foreground">{plan.period}</div>
            <div className="mt-1 inline-block px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
              50% OFF
            </div>
          </div>
          <div className="space-y-2">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
          <Button className="w-full" onClick={handleUpgrade} disabled={isLoading}>
            {isLoading ? "Loading..." : "Upgrade Now"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
