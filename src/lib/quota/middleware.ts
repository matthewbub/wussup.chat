import { QuotaManager } from "./quota-manager";
import { NextResponse } from "next/server";

export async function checkQuotaMiddleware(clerkUserId: string, quotaManager: QuotaManager) {
  const quotaCheck = await quotaManager.checkQuota(clerkUserId);

  if (!quotaCheck.hasQuota) {
    const message = quotaCheck.dailyLimitExceeded
      ? "You have reached your daily message limit. Try again tomorrow or upgrade your plan."
      : "You have reached your monthly message limit. Please upgrade your plan for continued access.";

    return NextResponse.json(
      {
        error: "Quota exceeded",
        dailyLimitExceeded: quotaCheck.dailyLimitExceeded,
        monthlyLimitExceeded: quotaCheck.monthlyLimitExceeded,
        message,
      },
      { status: 429 }
    );
  }

  return null;
}
