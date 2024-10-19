import puppeteer, { Browser, Page } from "puppeteer";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { runSignUpTest } from "./lib/signUp/signUpTest";
import { runReceiptUploadTest } from "./lib/receiptUpload/receiptUploadTest";

const extendedTimeout = 100000 * 5;

describe("Browser tests", () => {
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    browser = await puppeteer.launch({ headless: true });
    page = await browser.newPage();
  });

  afterAll(async () => {
    await browser.close();
  });

  it(
    "should run a series of checks to ensure user registration works correctly",
    async () => {
      const errors = await runSignUpTest(page);

      expect(errors.length).toBe(0);
    },
    // this is so hacky. I wrote these tests in my own little test lib
    // then decided to run them in a more conventional test lib (vitest)
    // so this is basically running a whole suite of tests and returning the errors
    // if any. if there are errors, the test will fail.
    // This is not the practice we want to keep moving forward
    // https://bsky.app/profile/matthewbub.bsky.social/post/3l62ocw7ufa2i
    extendedTimeout
  );

  it(
    "should run a series of checks to ensure receipt upload works correctly",
    async () => {
      const errors = await runReceiptUploadTest(page);

      expect(errors.length).toBe(0);
    },
    extendedTimeout
  );
});
