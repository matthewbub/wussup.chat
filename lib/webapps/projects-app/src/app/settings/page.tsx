"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AccountSettings } from "@/components/system/settings/AccountSettings";
import { BillingSettings } from "@/components/system/settings/BillingSettings";
import { AppSettings } from "@/components/system/settings/AppSettings";
import { useSearchParams } from "next/navigation";
import { DashboardLayout } from "@/components/system/DashboardLayout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function Settings() {
  return (
    <DashboardLayout
      activePage="settings"
      breadcrumbItems={[{ label: "Settings", href: "/settings" }]}
    >
      <Suspense fallback={<div>Loading...</div>}>
        <SettingsContent />
      </Suspense>
    </DashboardLayout>
  );
}

function SettingsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("account");
  const tabPattern = /[A-Z]/g;

  const handleTabChange = (tab: string) => {
    setActiveTab(tab.toLowerCase());
    router.replace(`/settings?tab=${tab.toLowerCase()}`);
  };

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      setActiveTab(tab.toLowerCase());
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
    <div>
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-3">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value.toLowerCase().replace(tabPattern, "")}
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {tabs.map((tab) => (
          <TabsContent
            key={tab.value}
            value={tab.value.toLowerCase().replace(tabPattern, "")}
            className="mt-4 p-6"
          >
            {tab.value === "account" && <AccountSettings />}
            {tab.value === "billing" && <BillingSettings />}
            {tab.value === "settings" && <AppSettings />}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
