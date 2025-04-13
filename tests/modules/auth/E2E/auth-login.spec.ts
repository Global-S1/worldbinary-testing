import { test } from '../../../common/fixture-base';
import { PASSWORD, EMAIL } from '../../../lib/auth-params';

test('Inicio de sesión exitoso con 2FA', async ({
  loginPage,
  context
}) => {

  await loginPage.openApplication();
  await loginPage.login('globals1test@yopmail.com', 'Holaquehace123*');

  const yopmailPage = await context.newPage();
  await yopmailPage.goto('https://yopmail.com/es/');
  await yopmailPage.locator('input#login').fill(EMAIL);
  await yopmailPage.getByRole('button', { name: '' }).click();
  await yopmailPage.waitForTimeout(4000);
  const fullText = await yopmailPage.locator('iframe[name="ifmail"]').contentFrame().getByText('2FA Сode:').innerText();
  const code = fullText.match(/\d{6}/)?.[0];
  await loginPage.page.bringToFront();
  const inputs = await loginPage.page.locator('input[type="number"]');

  for (let i = 0; i < code!.length; i++) {
    await inputs.nth(i).fill(code![i]);
  }


});
