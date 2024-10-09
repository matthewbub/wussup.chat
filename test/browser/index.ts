import { getTestResults } from "./logger";
import { runSignUpTest } from "./signUp/signUpTest";
import { runReceiptUploadTest } from "./receiptUpload/receiptUploadTest";
(async () => {
  const start = performance.now();
  console.log("Running test suites");

  await runSignUpTest();
  await runReceiptUploadTest();

  const end = performance.now();
  console.log(`Test suites completed in ${end - start} milliseconds`);
  console.log(getTestResults());
})();
