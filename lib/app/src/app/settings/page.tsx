"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthWrapper } from "@/components/system/AuthWrapper";
import { AuthHeader } from "@/components/system/AuthHeader";
import { AccountSettings } from "@/components/system/settings/AccountSettings";
import { BillingSettings } from "@/components/system/settings/BillingSettings";
import { AppSettings } from "@/components/system/settings/AppSettings";
import { useSearchParams } from "next/navigation";

export default function Settings() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState("account");
  const handleTabChange = (tab: string) => {
    setActiveTab(tab.toLowerCase().replace(/\s+/g, ""));
    // clear the search params
    router.replace("/settings");
  };

  const tabPattern = /[A-Z]/g;
  useEffect(() => {
    const tab = searchParams.get("tab");

    if (tab) {
      setActiveTab(tab.toLowerCase().replace(tabPattern, ""));
    }
  }, [searchParams]);

  const tabs = [
    {
      label: "Account",
      value: "account",
    },
    {
      label: "Billing",
      value: "billing",
    },
    {
      label: "App Settings",
      value: "settings",
    },
  ];

  return (
    <AuthWrapper>
      <div className="container mx-auto p-4">
        <AuthHeader />

        <div className="max-w-4xl mx-auto mt-8">
          <div className="border-b border-gray-200">
            <nav
              className="flex space-x-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg"
              aria-label="Tabs"
            >
              {tabs.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => handleTabChange(tab.value)}
                  className={`
                    flex-1 px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200
                    ${
                      activeTab ===
                      tab.value.toLowerCase().replace(tabPattern, "")
                        ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750"
                    }
                  `}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="mt-4 p-6 bg-slate-100 dark:bg-slate-900 rounded-lg shadow">
            {activeTab === "account" && <AccountSettings />}
            {activeTab === "billing" && <BillingSettings />}
            {activeTab === "settings" && <AppSettings />}
          </div>
        </div>
      </div>
    </AuthWrapper>
  );
}
