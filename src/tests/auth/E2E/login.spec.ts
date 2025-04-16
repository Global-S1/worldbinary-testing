import { test, expect } from '../../../common/fixture-base';
import { YopmailPage } from '../../../services-external/yopmail.page';

test.use({ storageState: { cookies: [], origins: [] } });
test('Inicio de sesión exitoso con 2FA', async ({
  loginPage,
  context
}) => {

  await loginPage.openApplication();
  await loginPage.login(
    process.env.EMAIL || '', 
    process.env.PASSWORD || '', 
  );
  await expect(loginPage.otpInputs.first()).toBeVisible();
  
  const yopmailPage = new YopmailPage(await context.newPage());
  await yopmailPage.open();
  await yopmailPage.checkInbox(process.env.EMAIL || '');
  const code = await yopmailPage.get2FACode();
  
  await loginPage.page.bringToFront();
  await loginPage.fillOtpCode(code);


});

test('Solicita credenciales de inicio de sesión', async ({
  loginPage
}) => {
  await loginPage.openApplication();
  await loginPage.login('', '');

  const emailError = await loginPage.page.locator('text=Email Address is required');
  await expect(emailError).toBeVisible();

  const passwordError = await loginPage.page.locator('text=Password is required');
  await expect(passwordError).toBeVisible(); 
});