/**
 * TODO:
 * - Add tests for the receipt items
 * - Add tests for the builtin back button
 * - Add tests for the ai image upload
 */
import { Page } from "puppeteer";
import TestLogger from "../logger";
import {
  fillSignUpForm,
  verifySuccessPage,
  verifyDashboardPage,
} from "../common";
import { faker } from "@faker-js/faker";

export async function runReceiptUploadTest(page: Page): Promise<string[]> {
  const testLogger = new TestLogger();
  const log = testLogger.log.bind(testLogger);
  const logError = testLogger.logError.bind(testLogger);
  const logSuccess = testLogger.logSuccess.bind(testLogger);

  console.log("Running receipt upload test");
  let errors: string[] = [];

  try {
    log("[Series]: Receipt upload");
    // call api/v1/invalidate-session
    const response = await fetch(
      "http://localhost:8080/api/v1/invalidate-session"
    );
    const data = await response.json();
    if (data.message !== "ok") {
      logError(data.message);
      errors.push(data.message);
    } else {
      logSuccess("Existing session invalidated");
    }

    // await page.goto("http://localhost:8080/receipt-upload");
    await page.goto("http://localhost:8080/sign-up");
    await fillSignUpForm(page);
    await verifySuccessPage(page, errors);
    await verifyDashboardPage(page, errors);

    // nav to add expenses page via the dashboard card
    await page.click("#add-expenses-card");
    const addExpensesPage = await page.$("#imageUploadForm");
    if (addExpensesPage) {
      logSuccess("User successfully landed on the add expenses page");
    } else {
      errors.push("Upload expenses page not found");
    }

    const uploadButton = await page.$("#zc-receipt-upload");
    if (uploadButton) {
      logSuccess("Upload button found, user can upload receipt via image");
    } else {
      errors.push(
        "Upload button not found, user cannot upload receipt via image"
      );
    }

    const manualUploadButton = await page.$("#manual-upload-button");
    if (manualUploadButton) {
      logSuccess(
        "Manual upload button found, user can upload receipt via manual input"
      );
    } else {
      errors.push(
        "Manual upload button not found, user cannot upload receipt via manual input"
      );
    }

    await page.click("#manual-upload-button");

    // Add a wait for navigation or element
    await page.waitForSelector("#results", { timeout: 5000 }).catch(() => null);

    // Log the current URL
    log(`Current URL: ${page.url()}`);

    // Check if the element exists and log its properties
    const manualUploadForm = await page.$("#results");
    if (manualUploadForm) {
      logSuccess(
        "User successfully landed on the upload receipt form via manual input page"
      );

      // Log additional details about the element
      // const isVisible = await manualUploadForm.isVisible();
      // log(`Is #results visible? ${isVisible}`);

      // const innerHTML = await page.evaluate(
      //   () => document.getElementById("results")?.innerHTML
      // );
      // log(`Contents of #results: ${innerHTML}`);
    } else {
      logError(
        "User did not land on the upload receipt form via manual input page"
      );

      // Log the page content for debugging
      // const pageContent = await page.content();
      // log(`Page content: ${pageContent.substring(0, 500)}...`); // Log first 500 characters
    }

    const merchant = faker.company.name();
    const date = new Date(
      faker.date.between({ from: "2024-10-01", to: new Date() })
    ).toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
    const total = faker.finance.amount({
      min: 5,
      max: 100,
      dec: 2,
      symbol: "$",
    });
    // fill out the fields
    await page.type("#zc-c-merchant", merchant);
    await page.type("#zc-c-date", date);
    await page.type("#zc-c-total", total);
    // submit the form
    await page.click("#next");
    // await page.waitForNavigation();

    const confirmationPage = await page.$('button[type="submit"]');
    if (confirmationPage) {
      logSuccess("User successfully landed on the receipt confirmation page");
    } else {
      errors.push("User did not land on the receipt confirmation page");
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));

    // confirm values
    const merchantValue = await page.evaluate(
      () => document.getElementById("merchant")?.textContent
    );
    log(`Found merchant value: ${merchantValue}`);

    const dateValue = await page.evaluate(
      () => document.getElementById("date")?.textContent
    );
    log(`Found date value: ${dateValue}`);

    const totalValue = await page.evaluate(
      () => document.getElementById("total")?.textContent
    );
    log(`Found total value: ${totalValue}`);

    // submit the form
    await page.click('button[type="submit"]');
    await page.waitForNavigation();
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
  }

  if (errors.length > 0) {
    return errors;
  }

  return [];
}
