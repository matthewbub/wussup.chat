import puppeteer from "puppeteer";
import {
  navigateToSignUpPage,
  fillSignUpForm,
  verifySecurityQuestionsPage,
  fillSecurityQuestionsForm,
  verifySuccessPage,
  verifyDashboardPage,
  fillDuplicateUsernameForm,
} from "./signUpUtils";
import { log, logError, logSuccess } from "../logger";
import { signOut } from "../common/signOut";

export async function runSignUpTest() {
  console.log("Running sign up test");
  let errors: string[] = [];
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    log("[Series]: sign up");
    await navigateToSignUpPage(page);
    const username = await fillSignUpForm(page);
    await verifySecurityQuestionsPage(page, errors);
    await fillSecurityQuestionsForm(page);
    await verifySuccessPage(page, errors);
    await verifyDashboardPage(page, errors);

    await signOut(page, errors);

    log("[Series]: duplicate username");
    await navigateToSignUpPage(page);
    await fillDuplicateUsernameForm(page, errors, username);
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
