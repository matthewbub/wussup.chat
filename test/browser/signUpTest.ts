import puppeteer from "puppeteer";

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto("http://localhost:8080/sign-up");

  // Fill the sign-up form
  await page.type('input[name="username"]', "testuser1");
  await page.type('input[name="email"]', "testuser1@example.com");
  await page.type('input[name="password"]', "TestPassword123");
  await page.type('input[name="confirm_password"]', "TestPassword123");
  await page.click('input[name="terms"]');
  await page.click('button[type="submit"]');

  // Wait for navigation and check the result
  await page.waitForNavigation();

  // Check for success message or error
  const successMessage = await page.$eval(".message", (el) => el.textContent);

  if (
    successMessage === "Account created successfully, please login to continue"
  ) {
    console.log(`Message: ${successMessage}`);
  } else {
    console.log("No message found");
  }

  await browser.close();
})();
