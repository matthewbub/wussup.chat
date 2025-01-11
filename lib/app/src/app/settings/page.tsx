"use client";

import {
  AuthWrapper,
  AuthHeader,
  AccountSettings,
  BillingSettings,
  AppSettings,
} from "@ninembs-studio/system-ui";
import { useRouter } from "next/navigation";

export default function Settings() {
  const router = useRouter();
  return (
    <AuthWrapper history={router}>
      <div className="container mx-auto p-4">
        <AuthHeader />

        <div className="max-w-4xl mx-auto mt-8">
          <div role="tablist" className="tabs tabs-lifted tabs-lg">
            <input
              type="radio"
              name="settings_tabs"
              role="tab"
              className="tab"
              aria-label="Account"
              defaultChecked
            />
            <div
              role="tabpanel"
              className="tab-content bg-base-100 border-base-300 rounded-b-box p-6"
            >
              <AccountSettings />
            </div>

            <input
              type="radio"
              name="settings_tabs"
              role="tab"
              className="tab"
              aria-label="Billing"
            />
            <div
              role="tabpanel"
              className="tab-content bg-base-100 border-base-300 rounded-b-box p-6"
            >
              <BillingSettings />
            </div>

            <input
              type="radio"
              name="settings_tabs"
              role="tab"
              className="tab"
              aria-label="App Settings"
            />
            <div
              role="tabpanel"
              className="tab-content bg-base-100 border-base-300 rounded-b-box p-6"
            >
              <AppSettings />
            </div>
          </div>
        </div>
      </div>
    </AuthWrapper>
  );
}
