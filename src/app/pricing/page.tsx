"use client";

import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const tiers = [
  {
    id: "tier-basic",
    name: "Basic",
    href: "#",
    priceMonthly: "$9",
    description: "Perfect for personal use and exploring AI capabilities.",
    features: [
      "OpenAI model access",
      "Basic chat functionality",
      "File attachments support",
      "100 messages per month",
      "Standard response time",
    ],
    featured: false,
  },
  {
    id: "tier-pro",
    name: "Professional",
    href: "#",
    priceMonthly: "$29",
    description: "Enhanced features for power users and professionals.",
    features: [
      "OpenAI & Anthropic models",
      "Web search capability",
      "Advanced thinking mode",
      "Image generation",
      "Unlimited messages",
      "Priority support",
    ],
    featured: true,
  },
];

export default function PricingPage() {
  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-base/7 font-semibold text-accent-foreground">
          Pricing
        </h2>
        <p className="mt-2 text-5xl font-semibold tracking-tight text-balance text-foreground sm:text-6xl">
          Choose the right plan for you
        </p>
      </div>
      <p className="mx-auto mt-6 max-w-2xl text-center text-lg font-medium text-pretty text-muted-foreground sm:text-xl/8">
        Choose an affordable plan that's packed with the best features for
        engaging your audience, creating customer loyalty, and driving sales.
      </p>
      <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 items-center gap-y-6 sm:mt-20 sm:gap-y-0 lg:max-w-4xl lg:grid-cols-2">
        {tiers.map((tier, tierIdx) => (
          <div
            key={tier.id}
            className={cn(
              tier.featured
                ? "relative bg-card shadow-2xl"
                : "bg-background/60 sm:mx-8 lg:mx-0",
              tier.featured
                ? ""
                : tierIdx === 0
                ? "rounded-t-3xl sm:rounded-b-none lg:rounded-tr-none lg:rounded-bl-3xl"
                : "sm:rounded-t-none lg:rounded-tr-3xl lg:rounded-bl-none",
              "rounded-3xl p-8 ring-1 ring-border sm:p-10"
            )}
          >
            <h3
              id={tier.id}
              className={cn(
                tier.featured
                  ? "text-accent-foreground"
                  : "text-accent-foreground",
                "text-base/7 font-semibold"
              )}
            >
              {tier.name}
            </h3>
            <p className="mt-4 flex items-baseline gap-x-2">
              <span
                className={cn(
                  tier.featured ? "text-card-foreground" : "text-foreground",
                  "text-5xl font-semibold tracking-tight"
                )}
              >
                {tier.priceMonthly}
              </span>
              <span
                className={cn(
                  tier.featured
                    ? "text-muted-foreground"
                    : "text-muted-foreground",
                  "text-base"
                )}
              >
                /month
              </span>
            </p>
            <p
              className={cn(
                tier.featured
                  ? "text-card-foreground/90"
                  : "text-muted-foreground",
                "mt-6 text-base/7"
              )}
            >
              {tier.description}
            </p>
            <ul
              role="list"
              className={cn(
                tier.featured
                  ? "text-card-foreground/90"
                  : "text-muted-foreground",
                "mt-8 space-y-3 text-sm/6 sm:mt-10"
              )}
            >
              {tier.features.map((feature) => (
                <li key={feature} className="flex gap-x-3">
                  <CheckIcon
                    aria-hidden="true"
                    className={cn(
                      tier.featured
                        ? "text-accent-foreground"
                        : "text-accent-foreground",
                      "h-6 w-5 flex-none"
                    )}
                  />
                  {feature}
                </li>
              ))}
            </ul>
            <a
              href={tier.href}
              aria-describedby={tier.id}
              className={cn(
                tier.featured
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:outline-primary"
                  : "text-accent-foreground ring-1 ring-border hover:ring-ring focus-visible:outline-accent-foreground",
                "mt-8 block rounded-md px-3.5 py-2.5 text-center text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 sm:mt-10"
              )}
            >
              Get started today
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
