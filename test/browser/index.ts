import { getTestResults } from "./logger";
import { runSignUpTest } from "./signUp/signUpTest";

(async () => {
  const start = performance.now();
  console.log("Running test suites");

  await runSignUpTest();

  const end = performance.now();
  console.log(`Test suites completed in ${end - start} milliseconds`);
  console.log(getTestResults());
})();
