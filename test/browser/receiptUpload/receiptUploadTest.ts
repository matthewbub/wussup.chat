// TODO: the terms and conditions checkbox should be tested
import puppeteer from "puppeteer";
import { log, logError, logSuccess } from "../logger";
import {
  fillSignUpForm,
  verifySecurityQuestionsPage,
  fillSecurityQuestionsForm,
  verifySuccessPage,
  verifyDashboardPage,
} from "../common";

export async function runReceiptUploadTest() {
  console.log("Running receipt upload test");
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

    // BEGIN RECEIPT UPLOAD TEST
    await page.goto("http://localhost:8080/receipt-upload");
    // await fillReceiptUploadForm(page);
    // await verifyReceiptUploadPage(page, errors);
    // await verifyReceiptUploadSuccessPage(page, errors);
    // END RECEIPT UPLOAD TEST
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
