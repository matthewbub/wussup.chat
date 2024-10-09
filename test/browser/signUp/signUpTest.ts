// TODO: the terms and conditions checkbox should be tested
import puppeteer from "puppeteer";
import {
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

export async function runSignUpTest() {
  console.log("Running sign up test");
  let errors: string[] = [];
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    log("[Series]: sign up");
    await page.goto("http://localhost:8080/sign-up");
    const username = await fillSignUpForm(page);
    await verifySecurityQuestionsPage(page, errors);
    await fillSecurityQuestionsForm(page);
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

    // Test when a user doesn't complete the security questions
    // For this case; we'll assume the user has completely left the app
    // and not they are trying to log in at the login page.
    // If they went to the sign up page, they would hit the duplicate email
    // or username test suite above
    // STRs
    // 1. Navigate to the sign up page
    // 2. Fill out the form fields (username, email, password, confirm password, terms)
    // 3. Click the sign up button
    // 4. Verify that the user is redirected to the security questions page
    // 5. Leave the security questions page blank and navigate to a different page ('/')
    // 6. The user should not be redirected when accessing a public page
    // 7. Attempt to visit the dashboard page
    // 7. The user should be redirected to the security questions
    // 8. Fill out the security questions
    // 9. Submit the form
    // 10. Verify that the user is redirected to the dashboard page
    // Test when a user doesn't complete the security questions
    log("[Series]: incomplete security questions");
    await page.goto("http://localhost:8080/sign-up");
    await fillSignUpForm(page);
    await verifySecurityQuestionsPage(
      page,
      errors,
      "User landed on the security questions page"
    );

    // Navigate away from the security questions page
    await page.goto("http://localhost:8080/");
    logSuccess("User left the sign up flow");

    // Attempt to access the dashboard
    await page.goto("http://localhost:8080/dashboard");
    await verifySecurityQuestionsPage(
      page,
      errors,
      "User landed on the security questions page"
    );

    // Complete the security questions
    await fillSecurityQuestionsForm(page);
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
