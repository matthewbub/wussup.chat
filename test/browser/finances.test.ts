import { describe, it, expect } from "vitest";
import testImage from "./imgs/Receipt_InNOut.jpg";
import puppeteer from "puppeteer";

const username = "testuser";
const password = "P@ZzW0rd!";

describe("Interacting with the finances page", () => {
  it("should navigate to the finances page", async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto("http://localhost:8080/login");
  });
});
