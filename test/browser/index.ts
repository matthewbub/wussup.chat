import puppeteer from "puppeteer";
import { getTestResults } from "./lib/logger";
import { runSignUpTest } from "./lib/signUp/signUpTest";
import { runReceiptUploadTest } from "./lib/receiptUpload/receiptUploadTest";
/**
 * This was the original test runner for the browser tests.
 * It's no longer used, but I'm keeping it around for now in case we want to revert.
 *
 * (This version does not require vite. just puppeteer and the local server.)
 */
(async () => {
  const start = performance.now();
  console.log("Running test suites");
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await runSignUpTest(page);
  await runReceiptUploadTest(page);

  const end = performance.now();
  console.log(`Test suites completed in ${end - start} milliseconds`);
  console.log(getTestResults());
  await browser.close();
})();
