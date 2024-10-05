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
}

export async function verifySecurityQuestionsPage(
  page: Page,
  errors: string[]
) {
  const securityQuestionsForm = await page.$("#security-questions-form");
  if (securityQuestionsForm) {
    logSuccess("Security questions form found");
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
    logSuccess("Success page found");
  } else {
    errors.push("No success page found");
  }
}

export async function verifyDashboardPage(page: Page, errors: string[]) {
  await page.waitForNavigation();
  const dashboardPage = await page.$("#dashboard");
  if (dashboardPage) {
    logSuccess("Dashboard page found");
  } else {
    errors.push("No dashboard page found");
  }
}
