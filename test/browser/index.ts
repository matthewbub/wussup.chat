import { getTestResults } from "./logger";
import { runSignUpTest } from "./signUp/signUpTest";
import { runReceiptUploadTest } from "./receiptUpload/receiptUploadTest";

/**
 * This was the original test runner for the browser tests.
 * It's no longer used, but I'm keeping it around for now in case we want to revert.
 *
 * (This version does not require vite. just puppeteer and the local server.)
 */
(async () => {
  const start = performance.now();
  console.log("Running test suites");

  await runSignUpTest();
  await runReceiptUploadTest();

  const end = performance.now();
  console.log(`Test suites completed in ${end - start} milliseconds`);
  console.log(getTestResults());
})();
