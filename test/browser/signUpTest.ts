import puppeteer from "puppeteer";

(async () => {
  let errors = [];
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto("http://localhost:8080/sign-up");

  // MILESTONE 1
  // Fill the sign-up form, land on the security questions page
  await page.type('input[name="username"]', "testuser2");
  await page.type('input[name="email"]', "testuser2@example.com");
  await page.type('input[name="password"]', "Test@Password123");
  await page.type('input[name="confirm_password"]', "Test@Password123");
  await page.click('input[name="terms"]');
  await page.click('button[type="submit"]');

  // Wait for navigation and check the result
  await page.waitForNavigation();

  // Land on security questions page
  const securityQuestionsForm = await page.$eval(
    "#security-questions-form",
    (el) => el
  );

  // if the form exists
  if (securityQuestionsForm) {
    console.log(`Form found`);
  } else {
    console.log("No form found");
    errors.push("No form found");
  }

  // MILESTONE 2
  // fill in the security form
  await page.select('select[name="question1"]', "pet");
  await page.type('input[name="answer1"]', "Fluffy");

  await page.select('select[name="question2"]', "mother");
  await page.type('input[name="answer2"]', "Smith");

  await page.select('select[name="question3"]', "book");
  await page.type('input[name="answer3"]', "The Hobbit");

  await page.click('button[type="submit"]');

  // Wait for navigation and check the result
  await page.waitForNavigation();

  // Check if the user is redirected to the success page
  const successPage = await page.$("#registration-success");
  if (successPage) {
    console.log("Success page found");
  } else {
    console.log("No success page found");
    errors.push("No success page found");
  }

  // MILESTONE 3
  // The user should be automatically redirected to the dashboard
  // after like 3 - 5 seconds
  await page.waitForNavigation();

  const dashboardPage = await page.$("#dashboard");
  if (dashboardPage) {
    console.log("Dashboard page found");
  } else {
    console.log("No dashboard page found");
    errors.push("No dashboard page found");
  }

  if (errors.length > 0) {
    console.log(errors);
  } else {
    console.log("All tests passed");
  }
  await browser.close();
})();
