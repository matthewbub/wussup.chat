import { Page } from "puppeteer";

export const reloadPage = async (page: Page) => {
  await page.reload();
};
