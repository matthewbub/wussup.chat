import { Page } from "puppeteer";
import { logSuccess } from "../logger";
import { randomBytes } from "crypto";

export async function navigateToSignUpPage(page: Page) {
  await page.goto("http://localhost:8080/sign-up");
}

export async function fillSignUpForm(page: Page) {
  const randomUsername = randomBytes(8).toString("hex");

  await page.type('input[name="username"]', randomUsername);
  await page.type('input[name="email"]', `${randomUsername}@example.com`);
  await page.type('input[name="password"]', "Test@Password123");
  await page.type('input[name="confirm_password"]', "Test@Password123");
  await page.click('input[name="terms"]');
  await page.click('button[type="submit"]');
  await page.waitForNavigation();

  return randomUsername;
}

export async function fillDuplicateUsernameForm(
  page: Page,
  errors: string[],
  username: string
) {
  const randomEmail = randomBytes(8).toString("hex");

  await page.type('input[name="username"]', username);
  await page.type('input[name="email"]', `${randomEmail}@example.com`);
  await page.type('input[name="password"]', "Test@Password123");
  await page.type('input[name="confirm_password"]', "Test@Password123");
  await page.click('input[name="terms"]');
  await page.click('button[type="submit"]');

  // Wait for the error message to appear
  await page.waitForSelector("#error-message", { visible: true });

  const errorMessage = await page.$("#error-message");
  let errorMessageText: string | null = null;

  if (errorMessage) {
    errorMessageText = await page.evaluate(
      (el) => el.textContent,
      errorMessage
    );

    if (errorMessageText === "Username already in use") {
      logSuccess("Error message found");
    } else {
      errors.push("Error message not found");
    }
  } else {
    errors.push("No error message found");
  }
}

export async function verifySecurityQuestionsPage(
  page: Page,
  errors: string[]
) {
  const securityQuestionsForm = await page.$("#security-questions-form");
  if (securityQuestionsForm) {
    logSuccess("User successfully filled sign up form");
  } else {
    errors.push("No security questions form found");
  }
}

export async function fillSecurityQuestionsForm(page: Page) {
  await page.select('select[name="question1"]', "pet");
  await page.type('input[name="answer1"]', "Fluffy");
  await page.select('select[name="question2"]', "mother");
  await page.type('input[name="answer2"]', "Smith");
  await page.select('select[name="question3"]', "book");
  await page.type('input[name="answer3"]', "The Hobbit");
  await page.click('button[type="submit"]');
  await page.waitForNavigation();
}

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

export async function fillDuplicateEmailForm(
  page: Page,
  errors: string[],
  username: string
) {
  await page.type('input[name="username"]', username);
  await page.type('input[name="email"]', `${username}@example.com`);
  await page.type('input[name="password"]', "Test@Password123");
  await page.type('input[name="confirm_password"]', "Test@Password123");
  await page.click('input[name="terms"]');
  await page.click('button[type="submit"]');
  await page.waitForNavigation();

  // Wait for the error message to appear
  await page.waitForSelector("#error-message", { visible: true });

  const errorMessage = await page.$("#error-message");
  let errorMessageText: string | null = null;

  if (errorMessage) {
    errorMessageText = await page.evaluate(
      (el) => el.textContent,
      errorMessage
    );

    if (errorMessageText === "Email address already in use") {
      logSuccess("Error message found");
    } else {
      errors.push("Error message not found");
    }
  } else {
    errors.push("No error message found");
  }
}

export async function fillInvalidPasswordForm(
  page: Page,
  errors: string[],
  username: string,
  testType: string
) {
  const randomEmail = randomBytes(8).toString("hex");
  let password = "Test@Password123"; // Default valid password
  let expectedErrorMessage = "";

  switch (testType) {
    case "short":
      password = "Short1!";
      expectedErrorMessage = "Password must be at least 8 characters";
      break;
    case "noUppercase":
      password = "test@password123";
      expectedErrorMessage =
        "Password must contain at least one uppercase letter";
      break;
    case "noLowercase":
      password = "TEST@PASSWORD123";
      expectedErrorMessage =
        "Password must contain at least one lowercase letter";
      break;
    case "noNumber":
      password = "Test@Password!";
      expectedErrorMessage = "Password must contain at least one number";
      break;
    case "noSpecialChar":
      password = "TestPassword123";
      expectedErrorMessage =
        "Password must contain at least one special character";
      break;
  }

  await page.type('input[name="username"]', username);
  await page.type('input[name="email"]', `${randomEmail}@example.com`);
  await page.type('input[name="password"]', password);
  await page.type('input[name="confirm_password"]', password);
  await page.click('input[name="terms"]');
  await page.click('button[type="submit"]');

  // Wait for the error message to appear
  await page.waitForSelector("#error-message", { visible: true });

  const errorMessage = await page.$("#error-message");
  let errorMessageText: string | null = null;

  if (errorMessage) {
    errorMessageText = await page.evaluate(
      (el) => el.textContent,
      errorMessage
    );

    if (errorMessageText && errorMessageText.includes(expectedErrorMessage)) {
      logSuccess(`Password criteria error message found for ${testType}`);
    } else {
      errors.push(`Password criteria error message not found for ${testType}`);
    }
  } else {
    errors.push(`No error message found for ${testType}`);
  }
}
