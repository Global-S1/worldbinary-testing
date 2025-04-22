import { chromium, expect, firefox, webkit } from '@playwright/test';
import { AuthLoginPage } from '../pages/auth.page';
import { PASSWORD } from '../config/params';
import { AuthRegisterPage } from '../pages/auth-register.page';
import { InboxKittenPage } from '../services-external/inboxkitten.page';

async function loginAndSaveStorageState(browserType, fileName: string) {
  const timeout = browserType.name() === 'webkit' ?  60000 : 30000;
  const browser = await browserType.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const inboxKittenPage = new InboxKittenPage(await context.newPage());
  await inboxKittenPage.open();
  const temporaryEmail = await inboxKittenPage.getTemporaryEmail();
  console.log('Temporary email:', temporaryEmail + "@inboxkitten.com");

  const registerPage = new AuthRegisterPage(page);
  (browserType.name() === 'webkit') ? registerPage.page.waitForTimeout(60000) : registerPage.page.waitForTimeout(30000);
  registerPage.openApplication();
  await registerPage.page.bringToFront();
  await registerPage.register(
    temporaryEmail + "@inboxkitten.com",
    temporaryEmail,
    PASSWORD,
    'Perú',
    true,
    true
  );

  
  await expect(registerPage.page.getByRole('button', { name: 'Continue' })).toBeVisible({ timeout });
  await registerPage.page.getByRole('button', { name: 'Continue' }).click();

  await registerPage.page.waitForTimeout(5000);
  await expect(registerPage.page.getByRole('button', { name: 'Operate Now' })).toBeVisible({ timeout });
  await registerPage.page.getByRole('button', { name: 'Operate Now' }).click();

  await inboxKittenPage.page.bringToFront();
  await inboxKittenPage.runToRegister(temporaryEmail);

  const loginPage = new AuthLoginPage(page);
  await loginPage.openApplication();
  await loginPage.page.bringToFront();
  await registerPage.page.waitForTimeout(5000);
  await loginPage.login(temporaryEmail + "@inboxkitten.com", PASSWORD);

 //Obtener el código 2FA desde InboxKitten
  await inboxKittenPage.page.bringToFront();
  await inboxKittenPage.navigateToInbox(temporaryEmail);
  await inboxKittenPage.page.waitForTimeout(2000);
  await inboxKittenPage.page.getByRole('button', { name: 'Refresh' }).click();
  const code = await inboxKittenPage.get2FACode();

  //Completar el inicio de sesión con el código 2FA
  await loginPage.page.bringToFront();
  await loginPage.fillOtpCode(code);

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
