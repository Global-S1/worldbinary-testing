import { Page } from '@playwright/test';

export async function getTemporaryEmail(page: Page): Promise<string> {
  await page.goto('https://inboxkitten.com/');
  const emailElement = page.locator('input[name="email"]');
  const email = await emailElement.inputValue();
  return email;
}

