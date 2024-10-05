import puppeteer from "puppeteer";
import {
  navigateToSignUpPage,
  fillSignUpForm,
  verifySecurityQuestionsPage,
  fillSecurityQuestionsForm,
  verifySuccessPage,
  verifyDashboardPage,
  fillDuplicateUsernameForm,
  fillDuplicateEmailForm,
  fillInvalidPasswordForm,
} from "./signUpUtils";
import { log, logError, logSuccess } from "../logger";
import { signOut } from "../common/signOut";
import { reloadPage } from "../common/reload";

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

    log("[Series]: username criteria");
    await navigateToSignUpPage(page);
    await fillDuplicateUsernameForm(page, errors, username);

    await reloadPage(page);

    log("[Series]: email criteria");
    await navigateToSignUpPage(page);
    await fillDuplicateEmailForm(page, errors, username);

    await reloadPage(page);

    // New series for password criteria
    log("[Series]: password criteria");
    await navigateToSignUpPage(page);
    // Test short password
    await fillInvalidPasswordForm(page, errors, username, "short");
    await reloadPage(page);
    await navigateToSignUpPage(page);
    // Test no uppercase
    await fillInvalidPasswordForm(page, errors, username, "noUppercase");
    await reloadPage(page);
    await navigateToSignUpPage(page);
    // Test no lowercase
    await fillInvalidPasswordForm(page, errors, username, "noLowercase");
    await reloadPage(page);
    await navigateToSignUpPage(page);
    // Test no number
    await fillInvalidPasswordForm(page, errors, username, "noNumber");
    await reloadPage(page);
    await navigateToSignUpPage(page);
    // Test no special character
    await fillInvalidPasswordForm(page, errors, username, "noSpecialChar");
    await reloadPage(page);
    await navigateToSignUpPage(page);

    await reloadPage(page);
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
