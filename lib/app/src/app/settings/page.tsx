"use client";

import { useState } from "react";
import { AuthWrapper } from "@/components/system/AuthWrapper";
import { AuthHeader } from "@/components/system/AuthHeader";
import { AccountSettings } from "@/components/system/settings/AccountSettings";
import { BillingSettings } from "@/components/system/settings/BillingSettings";
import { AppSettings } from "@/components/system/settings/AppSettings";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("Account");

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
              {["Account", "Billing", "App Settings"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`
                    flex-1 px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200
                    ${
                      activeTab === tab
                        ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750"
                    }
                  `}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          <div className="mt-4 p-6 bg-slate-100 dark:bg-slate-900 rounded-lg shadow">
            {activeTab === "Account" && <AccountSettings />}
            {activeTab === "Billing" && <BillingSettings />}
            {activeTab === "App Settings" && <AppSettings />}
          </div>
        </div>
      </div>
    </AuthWrapper>
  );
}
