import { Page } from "puppeteer";
import { logSuccess } from "./logger";
import { randomBytes } from "crypto";

export async function signOut(page: Page, errors: string[]) {
  try {
    await page.click("#logout-link");
    logSuccess("Signed out");
  } catch (error: any) {
    errors.push(error.message);
  }
}

export async function verifySecurityQuestionsPage(
  page: Page,
  errors: string[],
  message?: string
) {
  const securityQuestionsForm = await page.$("#security-questions-form");
  if (securityQuestionsForm) {
    logSuccess(message || "User successfully filled sign up form");
  } else {
    errors.push("No security questions form found");
  }
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
  await new Promise((resolve) => setTimeout(resolve, 2000));
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
