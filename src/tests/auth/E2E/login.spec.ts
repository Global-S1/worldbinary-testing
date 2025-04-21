import { test, expect } from '../../../common/fixture-base';
import { PASSWORD } from '../../../config/params';
import { InboxKittenPage } from '../../../services-external/inboxkitten.page';

test.use({ storageState: { cookies: [], origins: [] } });
test('Inicio de sesión exitoso con 2FA', async ({
  registerPage,
  loginPage,
  context,
  browserName
}) => {
  const timeout = browserName === 'webkit' ? 60000 : 3000;
  const inboxKittenPage = new InboxKittenPage(await context.newPage());
    await inboxKittenPage.open();
    const temporaryEmail = await inboxKittenPage.getTemporaryEmail();
    console.log('Temporary email:', temporaryEmail + "@inboxkitten.com");
    await registerPage.page.bringToFront();
    await registerPage.openApplication();
    await registerPage.register(
      temporaryEmail + "@inboxkitten.com",
      temporaryEmail,
      PASSWORD,
      'Perú',
      true,
      true
    );

  await registerPage.page.waitForTimeout(timeout);
  await loginPage.openApplication();
  await loginPage.login(temporaryEmail + "@inboxkitten.com",PASSWORD);
  await expect(loginPage.otpInputs.first()).toBeVisible();
  
  await inboxKittenPage.page.bringToFront();
  await inboxKittenPage.open();
  await inboxKittenPage.navigateToInbox(temporaryEmail);
  const code = await inboxKittenPage.get2FACode();
  
  await loginPage.page.bringToFront();
  await loginPage.fillOtpCode(code);
});

test('Solicita credenciales de inicio de sesión', async ({
  loginPage
}) => {
  await loginPage.openApplication();
  await loginPage.login('', '');

  const emailError = loginPage.page.locator('text=Email Address is required');
  await expect(emailError).toBeVisible();

  const passwordError = loginPage.page.locator('text=Password is required');
  await expect(passwordError).toBeVisible(); 
});