"use client";

import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";
import { useState } from "react";
import { useRouter } from "next/navigation";
import PublicHeader from "@/components/PublicHeader";
import Footer from "@/components/Footer";

const plans = [
  {
    name: "Pro (Alpha, 1 Month)",
    price: "$4.50",
    originalPrice: "$9.00",
    period: "one-time payment",
    description: "Perfect for trying out our service",
    popular: false,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_FOR__PRO_PLAN_ALPHA_ONE_MONTH,
  },
  {
    name: "Pro (Alpha, 3 Month)",
    price: "$12.00",
    originalPrice: "$24.00",
    period: "one-time payment",
    description: "Our most popular plan",
    popular: true,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_FOR__PRO_PLAN_ALPHA_THREE_MONTHS,
  },
  {
    name: "Pro (Alpha, 12 Month)",
    price: "$42.00",
    originalPrice: "$84.00",
    period: "one-time payment",
    description: "Best value for committed users",
    popular: false,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_FOR__PRO_PLAN_ALPHA_TWELVE_MONTHS,
  },
];

const features = [
  "1,500 chat messages per month",
  "Bring your own API key for unlimited chat messages",
  "Early access to experimental features",
  "Direct support line with the developers",
];

export default function PricingPage() {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleSelectPlan = async (priceId: string | undefined) => {
    if (!priceId) {
      console.error("No price ID found for plan");
      return;
    }

    if (!isSignedIn) {
      router.push("/sign-in?redirect_url=/pricing");
      return;
    }

    try {
      setIsLoading(priceId);
      const response = await fetch("/api/subscription/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ priceId }),
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
      setIsLoading(null);
    }
  };

  return (
    <>
      <PublicHeader />
      <div className="container mx-auto max-w-5xl py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Choose Your Plan</h1>
          <p className="text-muted-foreground">All plans are one-time payments, not subscriptions</p>

          <Badge variant="outline" className="bg-primary/10 text-primary mt-4 px-3 py-1">
            Limited Time Offer: 50% OFF
          </Badge>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-12">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-lg border p-6 shadow-sm transition-all hover:shadow-md ${
                plan.popular ? "border-primary ring-2 ring-primary" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-0 right-0 mx-auto w-fit rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                  Most Popular
                </div>
              )}

              <h3 className="text-lg font-medium">{plan.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>

              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="text-sm text-muted-foreground line-through">{plan.originalPrice}</span>
              </div>

              <div className="mt-1">
                <span className="text-sm text-primary">Save 50% • {plan.period}</span>
              </div>

              <Button
                className="mt-6 w-full"
                onClick={() => handleSelectPlan(plan.priceId)}
                disabled={isLoading === plan.priceId}
              >
                {isLoading === plan.priceId ? "Loading..." : "Select Plan"}
              </Button>
            </div>
          ))}
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-medium">All Plans Include:</h2>
          </div>

          <div className="space-y-3">
            {features.map((feature) => (
              <div key={feature} className="flex items-start gap-3 bg-muted/30 p-3 rounded-md">
                <div className="bg-primary/10 rounded-full p-1 mt-0.5">
                  <Check className="h-4 w-4 text-primary flex-shrink-0" />
                </div>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>Questions? Contact our support team for assistance.</p>
        </div>
      </div>
      <Footer />
    </>
  );
}
