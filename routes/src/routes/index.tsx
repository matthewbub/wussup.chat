import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowRight,
  FileText,
  Layout,
  List,
  Eye,
  Printer,
  Download,
  Shield,
  Users,
  FileSpreadsheet,
} from "lucide-react";
import { PublicLayout } from "@/components/PublicLayout";

export const Route = createFileRoute("/")({
  component: LandingPageComponent,
});

export function LandingPageComponent() {
  return (
    <PublicLayout>
      <div className="py-24 sm:py-32 lg:pb-40">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-balance text-5xl font-semibold tracking-tight text-gray-900 sm:text-7xl">
              Financial Management for{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500">
                Everyone
              </span>
            </h1>
            <p className="mt-8 text-pretty text-lg font-medium text-gray-500 sm:text-xl/8">
              Upload bank statements and receipts to automatically organize your
              finances. Our OCR technology matches receipts to transactions and
              structures everything for easy tax preparation.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <a
                href="#"
                className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Get started
              </a>
              <a href="#" className="text-sm/6 font-semibold text-gray-900">
                Learn more <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
          <div className="mt-16 flow-root sm:mt-24">
            <ImportBankStatement />
          </div>
        </div>
      </div>
      <main className="flex-1 mx-auto">
        <section
          id="features"
          className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800"
        >
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">
              Key Features
            </h2>
            <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3 items-start justify-center">
              <div className="flex flex-col items-center space-y-2 border-gray-800 p-4">
                <FileText className="h-12 w-12 mb-4 text-stone-900 dark:text-stone-50" />
                <h3 className="text-xl font-bold">
                  Smart Statement Processing
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  Upload bank statements and automatically convert them into
                  structured, analyzable data
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 border-gray-800 p-4">
                <Eye className="h-12 w-12 mb-4 text-stone-900 dark:text-stone-50" />
                <h3 className="text-xl font-bold">Receipt Matching</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  OCR technology automatically matches receipts to bank
                  transactions
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 border-gray-800 p-4">
                <Layout className="h-12 w-12 mb-4 text-stone-900 dark:text-stone-50" />
                <h3 className="text-xl font-bold">Selective Page Import</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  Import specific pages from PDF documents for precise control
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 border-gray-800 p-4">
                <Shield className="h-12 w-12 mb-4 text-stone-900 dark:text-stone-50" />
                <h3 className="text-xl font-bold">Privacy Protection</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  Block sensitive information before processing to ensure data
                  security
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 border-gray-800 p-4">
                <Users className="h-12 w-12 mb-4 text-stone-900 dark:text-stone-50" />
                <h3 className="text-xl font-bold">Team Collaboration</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  Create and manage teams for shared financial organization
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 border-gray-800 p-4">
                <FileSpreadsheet className="h-12 w-12 mb-4 text-stone-900 dark:text-stone-50" />
                <h3 className="text-xl font-bold">Tax Ready Reports</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  Generate organized reports perfect for tax preparation
                </p>
              </div>
            </div>
          </div>
        </section>
        <section
          id="pricing"
          className="w-full py-12 md:py-24 lg:py-32 bg-white"
        >
          <PricingModels />
        </section>

        <section id="get-started" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Start Managing Your Documents Today
                </h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Experience the power of our comprehensive document management
                  tool. Create, edit, organize, and share your documents with
                  ease.
                </p>
              </div>
              <div className="w-full max-w-sm space-y-2">
                <form className="flex space-x-2">
                  <Input
                    className="max-w-lg flex-1"
                    placeholder="Enter your email"
                    type="email"
                  />
                  <Button type="submit">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Sign up for free and start organizing your documents.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          © 2024 ZCauldron. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <a className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </a>
          <a className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </a>
        </nav>
      </footer>
    </PublicLayout>
  );
}

import { Fragment } from "react";
import { CheckIcon, MinusIcon } from "@heroicons/react/20/solid";
import ImportBankStatement from "@/components/ImportBankStatementApp/ImportBankStatement";

const tiers = [
  {
    name: "Starter",
    id: "tier-starter",
    href: "#",
    priceMonthly: "$15",
    pages: "100",
    pricePerPage: "0.15",
    mostPopular: false,
  },
  {
    name: "Small Firm",
    id: "tier-small",
    href: "#",
    priceMonthly: "$40",
    pages: "500",
    pricePerPage: "0.08",
    mostPopular: true,
  },
  {
    name: "Medium Firm",
    id: "tier-medium",
    href: "#",
    priceMonthly: "$80",
    pages: "1,500",
    pricePerPage: "0.053",
    mostPopular: false,
  },
  // {
  //   name: "Large Firm",
  //   id: "tier-large",
  //   href: "#",
  //   priceMonthly: "$150",
  //   pages: "4,000",
  //   pricePerPage: "0.0375",
  //   mostPopular: false,
  // },
  // {
  //   name: "Enterprise",
  //   id: "tier-enterprise",
  //   href: "#",
  //   priceMonthly: "$280",
  //   pages: "8,000",
  //   pricePerPage: "0.035",
  //   mostPopular: false,
  // },
];

const sections = [
  {
    name: "Core Features",
    features: [
      {
        name: "Monthly page allowance",
        tiers: {
          Starter: "100 pages",
          "Small Firm": "500 pages",
          "Medium Firm": "1,500 pages",
          "Large Firm": "4,000 pages",
          Enterprise: "8,000 pages",
        },
      },
      {
        name: "Bank statement processing",
        tiers: {
          Starter: true,
          "Small Firm": true,
          "Medium Firm": true,
          "Large Firm": true,
          Enterprise: true,
        },
      },
      {
        name: "Receipt OCR & matching",
        tiers: {
          Starter: true,
          "Small Firm": true,
          "Medium Firm": true,
          "Large Firm": true,
          Enterprise: true,
        },
      },
      {
        name: "Selective page import",
        tiers: {
          Starter: true,
          "Small Firm": true,
          "Medium Firm": true,
          "Large Firm": true,
          Enterprise: true,
        },
      },
    ],
  },
  {
    name: "Team Features",
    features: [
      {
        name: "Team members",
        tiers: {
          Starter: "2",
          "Small Firm": "5",
          "Medium Firm": "10",
          "Large Firm": "20",
          Enterprise: "Unlimited",
        },
      },
      {
        name: "Shared workspace",
        tiers: {
          Starter: true,
          "Small Firm": true,
          "Medium Firm": true,
          "Large Firm": true,
          Enterprise: true,
        },
      },
      {
        name: "Advanced permissions",
        tiers: {
          Starter: false,
          "Small Firm": true,
          "Medium Firm": true,
          "Large Firm": true,
          Enterprise: true,
        },
      },
      {
        name: "Custom roles",
        tiers: {
          Starter: false,
          "Small Firm": false,
          "Medium Firm": true,
          "Large Firm": true,
          Enterprise: true,
        },
      },
    ],
  },
  {
    name: "Support",
    features: [
      {
        name: "Email support",
        tiers: {
          Starter: true,
          "Small Firm": true,
          "Medium Firm": true,
          "Large Firm": true,
          Enterprise: true,
        },
      },
      {
        name: "Priority support",
        tiers: {
          Starter: false,
          "Small Firm": false,
          "Medium Firm": true,
          "Large Firm": true,
          Enterprise: true,
        },
      },
      {
        name: "Dedicated account manager",
        tiers: {
          Starter: false,
          "Small Firm": false,
          "Medium Firm": false,
          "Large Firm": true,
          Enterprise: true,
        },
      },
      {
        name: "Custom implementation",
        tiers: {
          Starter: false,
          "Small Firm": false,
          "Medium Firm": false,
          "Large Firm": false,
          Enterprise: true,
        },
      },
    ],
  },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function PricingModels() {
  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-base/7 font-semibold text-indigo-600">Pricing</h2>
          <p className="mt-2 text-balance text-5xl font-semibold tracking-tight text-gray-900 sm:text-6xl">
            Pricing that grows with you
          </p>
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-pretty text-center text-lg font-medium text-gray-600 sm:text-xl/8">
          Choose an affordable plan that’s packed with the best features for
          engaging your audience, creating customer loyalty, and driving sales.
        </p>

        {/* xs to lg */}
        <div className="mx-auto mt-12 max-w-md space-y-8 sm:mt-16 lg:hidden">
          {tiers.map((tier) => (
            <section
              key={tier.id}
              className={classNames(
                tier.mostPopular
                  ? "rounded-xl bg-gray-400/5 ring-1 ring-inset ring-gray-200"
                  : "",
                "p-8"
              )}
            >
              <h3
                id={tier.id}
                className="text-sm/6 font-semibold text-gray-900"
              >
                {tier.name}
              </h3>
              <p className="mt-2 flex items-baseline gap-x-1 text-gray-900">
                <span className="text-4xl font-semibold">
                  {tier.priceMonthly}
                </span>
                <span className="text-sm font-semibold">/month</span>
              </p>
              <a
                href={tier.href}
                aria-describedby={tier.id}
                className={classNames(
                  tier.mostPopular
                    ? "bg-indigo-600 text-white hover:bg-indigo-500"
                    : "text-indigo-600 ring-1 ring-inset ring-indigo-200 hover:ring-indigo-300",
                  "mt-8 block rounded-md px-3 py-2 text-center text-sm/6 font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                )}
              >
                Buy plan
              </a>
              <ul
                role="list"
                className="mt-10 space-y-4 text-sm/6 text-gray-900"
              >
                {sections.map((section) => (
                  <li key={section.name}>
                    <ul role="list" className="space-y-4">
                      {section.features.map((feature) =>
                        feature.tiers[tier.name] ? (
                          <li key={feature.name} className="flex gap-x-3">
                            <CheckIcon
                              aria-hidden="true"
                              className="h-6 w-5 flex-none text-indigo-600"
                            />
                            <span>
                              {feature.name}{" "}
                              {typeof feature.tiers[tier.name] === "string" ? (
                                <span className="text-sm/6 text-gray-500">
                                  ({feature.tiers[tier.name]})
                                </span>
                              ) : null}
                            </span>
                          </li>
                        ) : null
                      )}
                    </ul>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        {/* lg+ */}
        <div className="isolate mt-20 hidden lg:block">
          <div className="relative -mx-8">
            {tiers.some((tier) => tier.mostPopular) ? (
              <div className="absolute inset-x-4 inset-y-0 -z-10 flex">
                <div
                  style={{
                    marginLeft: `${(tiers.findIndex((tier) => tier.mostPopular) + 1) * 25}%`,
                  }}
                  aria-hidden="true"
                  className="flex w-1/4 px-4"
                >
                  <div className="w-full rounded-t-xl border-x border-t border-gray-900/10 bg-gray-400/5" />
                </div>
              </div>
            ) : null}
            <table className="w-full table-fixed border-separate border-spacing-x-8 text-left">
              <caption className="sr-only">Pricing plan comparison</caption>
              <colgroup>
                <col className="w-1/4" />
                <col className="w-1/4" />
                <col className="w-1/4" />
                <col className="w-1/4" />
              </colgroup>
              <thead>
                <tr>
                  <td />
                  {tiers.map((tier) => (
                    <th
                      key={tier.id}
                      scope="col"
                      className="px-6 pt-6 xl:px-8 xl:pt-8"
                    >
                      <div className="text-sm/7 font-semibold text-gray-900">
                        {tier.name}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">
                    <span className="sr-only">Price</span>
                  </th>
                  {tiers.map((tier) => (
                    <td key={tier.id} className="px-6 pt-2 xl:px-8">
                      <div className="flex items-baseline gap-x-1 text-gray-900">
                        <span className="text-4xl font-semibold">
                          {tier.priceMonthly}
                        </span>
                        <span className="text-sm/6 font-semibold">/month</span>
                      </div>
                      <a
                        href={tier.href}
                        className={classNames(
                          tier.mostPopular
                            ? "bg-indigo-600 text-white hover:bg-indigo-500"
                            : "text-indigo-600 ring-1 ring-inset ring-indigo-200 hover:ring-indigo-300",
                          "mt-8 block rounded-md px-3 py-2 text-center text-sm/6 font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        )}
                      >
                        Buy plan
                      </a>
                    </td>
                  ))}
                </tr>
                {sections.map((section, sectionIdx) => (
                  <Fragment key={section.name}>
                    <tr>
                      <th
                        scope="colgroup"
                        colSpan={4}
                        className={classNames(
                          sectionIdx === 0 ? "pt-8" : "pt-16",
                          "pb-4 text-sm/6 font-semibold text-gray-900"
                        )}
                      >
                        {section.name}
                        <div className="absolute inset-x-8 mt-4 h-px bg-gray-900/10" />
                      </th>
                    </tr>
                    {section.features.map((feature) => (
                      <tr key={feature.name}>
                        <th
                          scope="row"
                          className="py-4 text-sm/6 font-normal text-gray-900"
                        >
                          {feature.name}
                          <div className="absolute inset-x-8 mt-4 h-px bg-gray-900/5" />
                        </th>
                        {tiers.map((tier) => (
                          <td key={tier.id} className="px-6 py-4 xl:px-8">
                            {typeof feature.tiers[tier.name] === "string" ? (
                              <div className="text-center text-sm/6 text-gray-500">
                                {feature.tiers[tier.name]}
                              </div>
                            ) : (
                              <>
                                {feature.tiers[tier.name] === true ? (
                                  <CheckIcon
                                    aria-hidden="true"
                                    className="mx-auto size-5 text-indigo-600"
                                  />
                                ) : (
                                  <MinusIcon
                                    aria-hidden="true"
                                    className="mx-auto size-5 text-gray-400"
                                  />
                                )}

                                <span className="sr-only">
                                  {feature.tiers[tier.name] === true
                                    ? "Included"
                                    : "Not included"}{" "}
                                  in {tier.name}
                                </span>
                              </>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
