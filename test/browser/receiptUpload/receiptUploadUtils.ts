import { Page } from "puppeteer";
import { logSuccess } from "../logger";

export async function verifySuccessPage(page: Page, errors: string[]) {
  const successPage = await page.$("#registration-success");
  if (successPage) {
    logSuccess("User registration successful");
    logSuccess("User successfully filled security questions form");
  } else {
    errors.push("No success page found");
  }
}

export async function verifyDashboardPage(page: Page, errors: string[]) {
  await page.waitForNavigation();
  const dashboardPage = await page.$("#dashboard");
  if (dashboardPage) {
    logSuccess("User successfully landed on the dashboard page");
  } else {
    errors.push("No dashboard page found");
  }
}
