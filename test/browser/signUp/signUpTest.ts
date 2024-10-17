// TODO: the terms and conditions checkbox should be tested
import puppeteer from "puppeteer";
import {
  fillDuplicateUsernameForm,
  fillDuplicateEmailForm,
  fillInvalidPasswordForm,
} from "./signUpUtils";
import { log, logError, logSuccess } from "../logger";
import {
  signOut,
  fillSignUpForm,
  verifySecurityQuestionsPage,
  fillSecurityQuestionsForm,
  verifySuccessPage,
  verifyDashboardPage,
} from "../common";

export async function runSignUpTest(): Promise<string[]> {
  console.log("Running sign up test");
  let errors: string[] = [];
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    log("[Series]: sign up");
    await page.goto("http://localhost:8080/sign-up");
    const username = await fillSignUpForm(page);
    // await verifySecurityQuestionsPage(page, errors);
    // await fillSecurityQuestionsForm(page);
    await verifySuccessPage(page, errors);
    await verifyDashboardPage(page, errors);

    await signOut(page, errors);

    log("[Series]: sign up - username criteria");
    await page.goto("http://localhost:8080/sign-up");
    await fillDuplicateUsernameForm(page, errors, username);

    await page.reload();

    log("[Series]: sign up - email criteria");
    await page.goto("http://localhost:8080/sign-up");
    await fillDuplicateEmailForm(page, errors, username);

    await page.reload();

    // New series for password criteria
    log("[Series]: sign up - password criteria");
    await page.goto("http://localhost:8080/sign-up");
    // Test short password
    await fillInvalidPasswordForm(page, errors, username, "short");
    await page.reload();
    await page.goto("http://localhost:8080/sign-up");
    // Test no uppercase
    await fillInvalidPasswordForm(page, errors, username, "noUppercase");
    await page.reload();
    await page.goto("http://localhost:8080/sign-up");
    // Test no lowercase
    await fillInvalidPasswordForm(page, errors, username, "noLowercase");
    await page.reload();
    await page.goto("http://localhost:8080/sign-up");
    // Test no number
    await fillInvalidPasswordForm(page, errors, username, "noNumber");
    await page.reload();
    await page.goto("http://localhost:8080/sign-up");
    // Test no special character
    await fillInvalidPasswordForm(page, errors, username, "noSpecialChar");
    await page.reload();
    await page.goto("http://localhost:8080/sign-up");

    await page.reload();
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

  if (errors.length > 0) {
    return errors;
  }

  return [];
}
