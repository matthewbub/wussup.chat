import { describe, it, expect } from "vitest";
import puppeteer from "puppeteer";

describe("Authentication", () => {
  it("should sign in with test user credentials", async () => {
    const browser = await puppeteer.launch({
      headless: true,
      // slowMo: 100,
      devtools: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();

    try {
      // Set a longer timeout for the page
      // await page.setDefaultNavigationTimeout(30000);
      // await page.setDefaultTimeout(30000);

      // Navigate to the home page
      await page.goto("http://localhost:3000", { waitUntil: "networkidle0" });

      // Enable console log from the browser
      page.on("console", (msg) => console.log("Browser console:", msg.text()));

      // Log the page HTML for debugging
      const html = await page.content();
      // console.log("Current page HTML:", html);

      // Wait for and click the menu button first
      console.log("Waiting for menu button");
      await page.waitForSelector('button[aria-label="Open main menu"]', { timeout: 10000 });
      console.log("Clicking menu button");
      await page.click('button[aria-label="Open main menu"]');

      // Then wait for and click the login button
      console.log("Waiting for login button");
      await page.waitForSelector('button:has-text("Log in")', { timeout: 10000 });
      console.log("Clicking login button");
      await page.click('button:has-text("Log in")');

      // Wait for the auth modal to appear with a more specific selector
      await page.waitForSelector('div[role="dialog"] input[type="email"]', { timeout: 10000 });

      console.log("Filling in credentials");
      console.log(process.env.TEST_USER_EMAIL);
      console.log(process.env.TEST_USER_PASSWORD);
      console.log("End of credentials ");
      // Fill in the credentials
      await page.type('div[role="dialog"] input[type="email"]', process.env.TEST_USER_EMAIL || "");
      await page.type('div[role="dialog"] input[type="password"]', process.env.TEST_USER_PASSWORD || "");

      // Submit the form
      await page.click('div[role="dialog"] button[type="submit"]');

      // Wait for navigation after successful login
      await page.waitForNavigation({ waitUntil: "networkidle0" });

      // Verify we're on the chat page
      expect(page.url()).toBe("http://localhost:3000/~");
    } catch (error) {
      // Take screenshot on error

      console.error("Test failed:", error);
      throw error;
    } finally {
      await browser.close();
    }
  }, 30000); // Set test timeout to 30 seconds
});
