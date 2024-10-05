import puppeteer from "puppeteer";
import {
  navigateToSignUpPage,
  fillSignUpForm,
  verifySecurityQuestionsPage,
  fillSecurityQuestionsForm,
  verifySuccessPage,
  verifyDashboardPage,
} from "./signUpUtils";
import { logError, logSuccess } from "../logger";

export async function runSignUpTest() {
  console.log("Running sign up test");
  let errors: string[] = [];
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await navigateToSignUpPage(page);
    await fillSignUpForm(page);
    await verifySecurityQuestionsPage(page, errors);
    await fillSecurityQuestionsForm(page);
    await verifySuccessPage(page, errors);
    await verifyDashboardPage(page, errors);
  } catch (error: any) {
    console.error("An error occurred:", error);
    errors.push(error?.message || "Unknown error");
  } finally {
    if (errors.length > 0) {
      for (const error of errors) {
        logError(error);
      }
    } else {
      logSuccess("All tests passed");
    }
    await browser.close();
  }
}
