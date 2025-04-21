import { Locator, Page } from '@playwright/test';

export class InboxKittenPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly emailWith2FACode: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('input[name="email"]');
    this.emailWith2FACode = page.locator('.row-subject').filter({ hasText: '2FA Сode:' });
  }

  async open() {
    await this.page.goto('https://inboxkitten.com/');
  }

  async getTemporaryEmail(): Promise<string> {
    const email = await this.emailInput.inputValue();
    return email;
  }

  async navigateToInbox(email: string) {
    await this.page.goto(`https://inboxkitten.com/inbox/${email}/list`);
  }

  /**
   * Busca un correo específico en el buzón.
   * @param subject Texto del asunto del correo.
   * @param maxAttempts Número máximo de intentos para buscar el correo.
   * @returns `true` si el correo se encuentra, `false` en caso contrario.
   */
  async findEmail(subject: string, maxAttempts = 10): Promise<boolean> {
    const refreshButtonLocator = this.page.locator('button.refresh-button');
    const emailSubjectLocator = this.page.locator(`.row-subject:has-text("${subject}")`);

    let attempt = 0;
    while (attempt < maxAttempts) {
      const emailCount = await emailSubjectLocator.count();
      if (emailCount > 0) {
        console.log('Correo encontrado:', subject);
        return true;
      }

      const refreshButtonCount = await refreshButtonLocator.count();
      if (refreshButtonCount > 0) {
        await refreshButtonLocator.click();
      } else {
        console.log('Botón de refresco no encontrado, buscando correo...');
      }

      await this.page.waitForTimeout(2000);
      attempt++;
    }

    console.log('Correo no encontrado después de varios intentos.');
    return false;
  }

  /**
   * Confirma la cuenta haciendo click en el enlace dentro del correo.
   */
  async confirmAccount() {
    await this.page.getByText('🚀 ¡Bienvenido/a a World').click();
    const iframe = this.page.frameLocator('#message-content');
    const confirmationLinkLocator = iframe.getByRole('link', { name: 'Confirmar Cuenta' });

    await confirmationLinkLocator.click();
    console.log('Cuenta confirmada exitosamente.');
  }

  async get2FACode(): Promise<string> {
    await this.emailWith2FACode.waitFor({ state: 'visible', timeout: 30000 });
    const fullText = await this.emailWith2FACode.innerText();
    const codeMatch = fullText.match(/\d{6}/);

    if (!codeMatch) {
      throw new Error('Código 2FA no encontrado en el correo.');
    }
    const code = codeMatch[0];
    console.log('Código 2FA extraído:', code);
    return code;
  }

  async runToRegister(temporaryEmail: string) {
    const emailWithProvider = temporaryEmail + "@inboxkitten.com";
    await this.navigateToInbox(emailWithProvider);
    const emailFound = await this.findEmail('¡Bienvenido/a a World Binary!');
    if (!emailFound) throw new Error('No se encontró el correo después de varios intentos.');
    await this.confirmAccount();
    console.log('✅ Registro completado exitosamente.');
  }
}