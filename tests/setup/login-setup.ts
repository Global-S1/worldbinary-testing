import { chromium, firefox, webkit } from '@playwright/test';
import { EMAIL, PASSWORD } from '../lib/auth-params';
import { AuthLoginPage } from '../modules/auth/pages/auth-login.page';

async function loginAndSaveStorageState(browserType, fileName: string) {
  const browser = await browserType.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  const loginPage = new AuthLoginPage(page);
  await loginPage.openApplication();
  await loginPage.login(EMAIL, PASSWORD);

  const yopmailPage = await context.newPage();
  await yopmailPage.goto('https://yopmail.com/es/');
  await yopmailPage.locator('input#login').fill(EMAIL);
  await yopmailPage.getByRole('button', { name: '' }).click();
  await yopmailPage.waitForTimeout(4000);

  const frame = await yopmailPage.frameLocator('iframe#ifmail');
  const fullText = await frame.locator('body').innerText();
  const code = fullText.match(/\d{6}/)?.[0];

  if (!code) {
    throw new Error('No se encontró el código 2FA en el correo');
  }

  await page.bringToFront();
  const inputs = await page.locator('input[type="number"]');
  for (let i = 0; i < code.length; i++) {
    await inputs.nth(i).fill(code[i]);
  }

  await page.waitForTimeout(5000);
  const user = await page.evaluate(() => localStorage.getItem('current-user'));
  console.log(`[${fileName}] current-user:`, user);

  await context.storageState({ path: fileName });
  console.log(`✅ ${fileName} guardado con éxito.`);
  await browser.close();
}

(async () => {
  await loginAndSaveStorageState(chromium, 'storageState.chromium.json');
  await loginAndSaveStorageState(firefox, 'storageState.firefox.json');
  await loginAndSaveStorageState(webkit, 'storageState.webkit.json');
})();
