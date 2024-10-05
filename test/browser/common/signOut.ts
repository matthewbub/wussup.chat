import { Page } from "puppeteer";
import { logSuccess } from "../logger";

export async function signOut(page: Page, errors: string[]) {
  try {
    await page.click("#logout-link");
    logSuccess("Signed out");
  } catch (error: any) {
    errors.push(error.message);
  }
}
