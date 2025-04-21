import { test, expect } from '../../../common/fixture-base';
import { TEMPORARY_EMAIL, PASSWORD } from '../../../config/params';
import { InboxKittenPage } from '../../../services-external/inboxkitten.page';

test.use({ storageState: { cookies: [], origins: [] } });
test('Registro de usuario con correo temporal', async ({ registerPage, browserName }) => {
  const inboxKittenPage = new InboxKittenPage(registerPage.page);
  await inboxKittenPage.open();
  const temporaryEmail = await inboxKittenPage.getTemporaryEmail();
  console.log('Temporary email:', temporaryEmail + "@inboxkitten.com");

  await registerPage.openApplication();
  await registerPage.register(
    temporaryEmail + "@inboxkitten.com",
    temporaryEmail,
    PASSWORD,
    'Perú',
    true,
    true
  );
  const timeout = browserName === 'webkit' ? 60000 : 10000;
   await registerPage.page.getByRole('button', { name: 'Continue' }).waitFor({ state: 'visible', timeout });
   await registerPage.page.getByRole('button', { name: 'Continue' }).click();
 
   await registerPage.page.getByRole('button', { name: 'Operate Now' }).waitFor({ state: 'visible', timeout });
   await registerPage.page.getByRole('button', { name: 'Operate Now' }).click();

  await inboxKittenPage.runToRegister(temporaryEmail);
});

test('Intento de registro sin aceptar términos y cookies', async ({
  registerPage
}) => {

  await registerPage.openApplication();

  await registerPage.register(
    TEMPORARY_EMAIL + "@yopmail.com",
    TEMPORARY_EMAIL,
    PASSWORD,
    'Perú',
    false,
    false
  );

  const submitButton = registerPage.submitButton;
  await expect(submitButton).toHaveAttribute('disabled');
});

test('Intento de registro sin llenar todos los campos', async ({
  registerPage
}) => {
  await registerPage.openApplication();
  await registerPage.register(
    '',
    '',
    PASSWORD,
    'Perú',
    true,
    true
  );

  const emailError = registerPage.page.locator('text=Email Address is required');
  await expect(emailError).toBeVisible();

  const firstName = registerPage.page.locator('text=First Name is required');
  await expect(firstName).toBeVisible();
});