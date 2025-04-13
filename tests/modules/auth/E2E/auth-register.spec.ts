import { test, expect } from '@playwright/test';
import { EMAIL_PROVIDER, COUNTRY, PASSWORD } from '../../../lib/auth-params';
import { getTemporaryEmail } from '../../../services-external/getTemporaryEmail.service';
import { AuthRegisterPage } from '../pages/auth-register.page';

test('Registro de usuario con correo temporal', async ({ page }) => {
  const authRegisterPage = new AuthRegisterPage(page);

  const temporaryEmail = await getTemporaryEmail(page);
  console.log('Temporary email:', temporaryEmail + EMAIL_PROVIDER);

  await authRegisterPage.openApplication();

  await authRegisterPage.register(
    temporaryEmail + EMAIL_PROVIDER,
    temporaryEmail,
    PASSWORD,
    COUNTRY,
    true,
    true
  );

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
    }else{
      await refreshButtonLocator.click();
      await page.waitForTimeout(2000); 
    }

    attempt++;
  }

  if (emailFound) {
    await emailSubjectLocator.click();

    const iframe = await page.frameLocator('#message-content');
    const confirmationLinkLocator = iframe.getByRole('link', { name: 'Confirmar Cuenta' });
    await confirmationLinkLocator.click();

    //const goToBoardButton = page.locator('button', { hasText: 'Go to the board' });
    //await goToBoardButton.click();
 
  } else {
    throw new Error('No se encontró el correo después de varios intentos');
  }

});