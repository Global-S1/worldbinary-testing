import { test, expect } from '@playwright/test';
import { EMAIL_PROVIDER } from '../../../config/params';
import { getTemporaryEmail } from '../../../services-external/getTemporaryEmail.service';
import { AuthRegisterPage } from '../../../pages/auth-register.page';

test.use({ storageState: { cookies: [], origins: [] } });
test('Registro de usuario con correo temporal', async ({ page }) => {
  const authRegisterPage = new AuthRegisterPage(page);

  const temporaryEmail = await getTemporaryEmail(page);
  console.log('Temporary email:', temporaryEmail + EMAIL_PROVIDER);

  await authRegisterPage.openApplication();

  await authRegisterPage.register(
    temporaryEmail + EMAIL_PROVIDER,
    temporaryEmail,
    process.env.PASSWORD || '',
    'Perú',
    true,
    true
  );

  await page.waitForTimeout(5000);
  await expect(page.getByRole('button', { name: 'Continue' })).toBeVisible();
  await page.getByRole('button', { name: 'Continue' }).click();

  await expect(page.getByRole('button', { name: 'Operate Now' })).toBeVisible();
  await page.getByRole('button', { name: 'Operate Now' }).click();


  await page.goto('https://inboxkitten.com/inbox/' + temporaryEmail + EMAIL_PROVIDER + '/list');
  const refreshButtonLocator = page.locator('button.refresh-button');
  const emailSubjectLocator = page.locator('.row-subject:has-text("¡Bienvenido/a a World Binary!")');

  const maxAttempts = 10;
  let attempt = 0;
  let emailFound = false;

  while (attempt < maxAttempts && !emailFound) {
    const emailCount = await emailSubjectLocator.count();
    if (emailCount > 0) {
      emailFound = true;
      break;
    } else {
      const refreshButtonCount = await refreshButtonLocator.count();
      if (refreshButtonCount > 0) {
        await refreshButtonLocator.click();
      } else {
        console.log('boton refresh no encontrado, buscar email');
      }
      await page.waitForTimeout(2000);
    }

    attempt++;
  }

  if (emailFound) {
    await emailSubjectLocator.click();

    const iframe = await page.frameLocator('#message-content');
    const confirmationLinkLocator = iframe.getByRole('link', { name: 'Confirmar Cuenta' });
    await confirmationLinkLocator.click();

  } else {
    throw new Error('No se encontró el correo después de varios intentos');
  }

});

test('Intento de registro sin aceptar términos y cookies', async ({ page }) => {
  const authRegisterPage = new AuthRegisterPage(page);

  const temporaryEmail = await getTemporaryEmail(page);
  console.log('Temporary email:', temporaryEmail + EMAIL_PROVIDER);

  await authRegisterPage.openApplication();

  await authRegisterPage.register(
    temporaryEmail + EMAIL_PROVIDER,
    temporaryEmail,
    process.env.PASSWORD || '',
    'Perú',
    false,
    false
  );

  const submitButton = authRegisterPage.submitButton;
  await expect(submitButton).toHaveAttribute('disabled');
});

test('Intento de registro sin llenar todos los campos', async ({ page }) => {
  const authRegisterPage = new AuthRegisterPage(page);

  await authRegisterPage.openApplication();

  await authRegisterPage.register(
    '',
    '',
    process.env.PASSWORD || '',
    'Perú',
    true,
    true
  );

  const emailError = await page.locator('text=Email Address is required');
  await expect(emailError).toBeVisible();

  const firstName = await page.locator('text=First Name is required');
  await expect(firstName).toBeVisible();
});