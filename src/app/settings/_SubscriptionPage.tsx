"use client";

import Link from "next/link";
import { CalendarIcon, CheckIcon, CreditCardIcon, GaugeIcon, InfoIcon } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PurchaseHistory, SubscriptionStatus } from "@/lib/subscription/subscription-facade";
import { toast } from "@/hooks/use-toast";

export default function SubscriptionSettings({
  userSubscriptionInfo,
  purchaseHistory,
}: {
  userSubscriptionInfo: SubscriptionStatus;
  purchaseHistory: PurchaseHistory[];
}) {
  console.log(userSubscriptionInfo);
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="px-4 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Subscription</h1>
      </div>

      {userSubscriptionInfo.subscriptionStatus === "active" ? (
        <SubscribedView userSubscriptionInfo={userSubscriptionInfo} purchaseHistory={purchaseHistory} />
      ) : (
        <UnsubscribedView />
      )}
    </div>
  );
}

function SubscribedView({
  userSubscriptionInfo,
  purchaseHistory,
}: {
  userSubscriptionInfo: SubscriptionStatus;
  purchaseHistory: PurchaseHistory[];
}) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleCancelSubscription = async () => {
    if (!confirm("Are you sure you want to cancel your subscription?")) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/subscription/cancel", {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to cancel subscription");
      }

      toast.success("Subscription cancellation scheduled for the end of the billing period");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  // Format the subscription end date
  const formattedEndDate = userSubscriptionInfo.subscriptionEndDate?.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Determine if subscription is cancellation pending
  const isCancellationPending = userSubscriptionInfo.subscriptionStatus === "cancellation_pending";

  return (
    <div className="space-y-6 gap-20 flex flex-col">
      <Card className="border-none">
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>Your subscription details and usage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-2">
            <Badge variant="default" className="uppercase">
              {userSubscriptionInfo.planName}
            </Badge>
            {userSubscriptionInfo.recurringOrOneTimePayment === "one-time" && <Badge variant="outline">One-time</Badge>}
            {isCancellationPending && <Badge variant="destructive">Cancels on {formattedEndDate}</Badge>}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-2">
              <CalendarIcon className="mt-0.5 h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">
                  {userSubscriptionInfo.recurringOrOneTimePayment === "one-time" ? "Access Until" : "Renewal Date"}
                </p>
                <p className="text-muted-foreground">{formattedEndDate}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CreditCardIcon className="mt-0.5 h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Billing</p>
                <p className="text-muted-foreground">
                  Customer ID: {userSubscriptionInfo.customerId?.substring(0, 8)}...
                </p>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => document.getElementById("pricing-section")?.scrollIntoView({ behavior: "smooth" })}
          >
            Change Plan
          </Button>
          {userSubscriptionInfo.recurringOrOneTimePayment === "recurring" && !isCancellationPending && (
            <Button variant="destructive" onClick={handleCancelSubscription} disabled={isLoading}>
              {isLoading ? "Cancelling..." : "Cancel Subscription"}
            </Button>
          )}
          {isCancellationPending && (
            <div className="text-sm text-muted-foreground mt-2">
              Your subscription will remain active until the end of the current billing period, after which it will be
              automatically cancelled.
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-none">
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>View your past invoices and payment history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="p-4 text-left font-medium">Date</th>
                  <th className="p-4 text-left font-medium">Type</th>
                  <th className="p-4 text-left font-medium">Amount</th>
                  <th className="p-4 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {purchaseHistory.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-gray-500">
                      No purchase history available
                    </td>
                  </tr>
                ) : (
                  purchaseHistory.map((purchase) => (
                    <tr className="border-b" key={purchase.id}>
                      <td className="p-4">
                        {new Date(purchase.purchase_date).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="p-4 ">
                        <Badge variant="outline">{purchase.plan_name}</Badge>
                      </td>
                      <td className="p-4">${(purchase.amount_paid / 100).toFixed(2)}</td>
                      <td className="p-4 text-green-600">Paid</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      <Card className="border-none">
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
          <CardDescription>If something doesn't seem right with your subscription or payments</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Our support team is here to help if you have any questions about your subscription, billing, or if you
            notice any discrepancies in your payment history.
          </p>
          <Button
            size="lg"
            variant="outline"
            className="w-full"
            onClick={() => (window.location.href = "mailto:matthew@wussup.chat")}
          >
            Contact Support
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function UnsubscribedView() {
  const [isLoadingPlan, setIsLoadingPlan] = useState<string | null>(null);

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
      name: "Pro (Alpha, 1 Month Recurring)",
      price: "$4.50",
      originalPrice: "$9.00",
      period: "monthly subscription",
      description: "Our most popular plan",
      popular: true,
      priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_FOR__PRO_PLAN_ALPHA_ONE_MONTH_RECURRING,
    },
    {
      name: "Pro (Alpha, 3 Month)",
      price: "$12.00",
      originalPrice: "$24.00",
      period: "one-time payment",
      description: "Great quarterly value",
      popular: false,
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

  const handlePurchase = async (priceId: string) => {
    setIsLoadingPlan(priceId);

    try {
      const response = await fetch("/api/subscription/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create checkout session");
      }

      const data = await response.json();
      window.location.href = data.url;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
      setIsLoadingPlan(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="grid grid-cols-1 md:grid-cols-12 border-none divide-y md:divide-y-0 md:divide-x divide-border">
        <CardHeader className="col-span-1 md:col-span-4">
          <CardTitle>Free Plan</CardTitle>
          <CardDescription>Your current plan</CardDescription>
        </CardHeader>
        <CardContent className="col-span-1 md:col-span-8 space-y-4">
          <div className="flex items-start gap-2 pt-2">
            <GaugeIcon className="mt-0.5 h-5 w-5 text-muted-foreground" />
            <div className=" text-muted-foreground">
              Upgrade to get 1,500 messages per month or bring your own API key for unlimited usage
            </div>
          </div>
          <Button
            className="w-full"
            onClick={() => document.getElementById("pricing-section")?.scrollIntoView({ behavior: "smooth" })}
          >
            View Upgrade Options
          </Button>
        </CardContent>
      </Card>

      <Card
        className="grid grid-cols-1 md:grid-cols-12 border-none divide-y md:divide-y-0 md:divide-x divide-border"
        id="pricing-section"
      >
        <CardHeader className="col-span-1 md:col-span-4">
          <CardTitle>Upgrade Your Experience</CardTitle>
          <CardDescription>
            <span className="flex items-center gap-1">
              <InfoIcon className="h-4 w-4" />
              Alpha Program: 50% off all plans for a limited time
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="col-span-1 md:col-span-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
            {plans.map((plan, index) => (
              <PricingCard
                key={index}
                title={plan.name}
                price={plan.price}
                originalPrice={plan.originalPrice}
                period={plan.period}
                description={plan.description}
                features={features}
                popular={plan.popular}
                ctaText={isLoadingPlan === plan.priceId ? "Loading..." : "Choose Plan"}
                isLoading={isLoadingPlan === plan.priceId}
                onPurchase={() => handlePurchase(plan.priceId ?? "")}
              />
            ))}
          </div>
        </CardContent>
        <CardFooter className="col-span-1 md:col-span-12">
          <div className=" text-muted-foreground">
            Need a custom plan?{" "}
            <Link href="/contact" className="font-medium underline">
              Contact us
            </Link>{" "}
            for more information.
          </div>
        </CardFooter>
      </Card>
      <Card className="grid grid-cols-1 md:grid-cols-12 border-none divide-y md:divide-y-0 md:divide-x divide-border">
        <CardHeader className="col-span-1 md:col-span-4">
          <CardTitle>Need Help?</CardTitle>
          <CardDescription>Questions about our plans or having trouble upgrading?</CardDescription>
        </CardHeader>
        <CardContent className="col-span-1 md:col-span-8">
          <p className=" text-muted-foreground mb-4">
            We're here to answer any questions about our plans, help you choose the right option, or assist with any
            technical issues.
          </p>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => (window.location.href = "mailto:matthew@wussup.chat")}
          >
            Contact Support
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function PricingCard({
  title,
  price,
  originalPrice,
  period = "month",
  description,
  features,
  popular = false,
  ctaText = "Get Started",
  isLoading = false,
  onPurchase,
}: {
  title: string;
  price: string;
  originalPrice: string;
  period: string;
  description: string;
  features: string[];
  popular: boolean;
  ctaText: string;
  isLoading?: boolean;
  onPurchase: () => void;
}) {
  return (
    <Card className={`flex flex-col ${popular ? "border-primary shadow-md" : ""}`}>
      {popular && (
        <div className="py-1 text-xs font-medium text-center text-primary-foreground bg-primary">MOST POPULAR</div>
      )}
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="mb-4">
          <div className="flex items-baseline">
            <span className="text-3xl font-bold">{price}</span>
          </div>
          <div className=" text-muted-foreground line-through">{originalPrice}</div>
          <div className="text-xs text-muted-foreground">{period}</div>
          <div className="mt-1 inline-block px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
            50% OFF
          </div>
        </div>
        <ul className="space-y-2 ">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <CheckIcon className="mr-2 h-4 w-4 shrink-0 text-green-500" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        <Button className="w-full" variant={popular ? "default" : "outline"} onClick={onPurchase} disabled={isLoading}>
          {ctaText}
        </Button>
      </CardContent>
    </Card>
  );
}
