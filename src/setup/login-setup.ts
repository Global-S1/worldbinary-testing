import { chromium, firefox, webkit } from '@playwright/test';
import { AuthLoginPage } from '../pages/auth.page';
import { EMAIL, PASSWORD } from '../config/params';

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
  await page.waitForTimeout(2000);
  const inputs = await page.locator('input[type="number"]');
  for (let i = 0; i < code.length; i++) {
    await inputs.nth(i).fill(code[i]);
  }

  await page.waitForTimeout(5000);

  await context.storageState({ path: fileName });
  console.log(`✅ ${fileName} guardado con éxito.`);
  await browser.close();
}

(async () => {
  await loginAndSaveStorageState(chromium, 'src/setup/sessions/storageState.chromium.json');
  await loginAndSaveStorageState(firefox, 'src/setup/sessions/storageState.firefox.json');
  await loginAndSaveStorageState(webkit, 'src/setup/sessions/storageState.webkit.json');
})();
