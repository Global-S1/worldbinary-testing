import { Locator, Page } from '@playwright/test';
import { PageBase } from '../common/page-base';

export class AuthLoginPage extends PageBase {
    readonly emailInput: Locator;
    readonly passwordInput: Locator;
    readonly submitButton: Locator;
    readonly otpInputs: Locator;

    constructor(page: Page) {
        super(page, 'auth');
        this.emailInput = page.locator('input[name="email"]');
        this.passwordInput = page.locator('input[name="password"]');
        this.submitButton = page.locator('button[type="submit"]');
        this.otpInputs = page.locator('input[type="number"]');
    }

    async login(emailValue: string, passwordValue: string) {
        await this.emailInput.fill(emailValue);
        await this.passwordInput.fill(passwordValue);
        await this.submitButton.click();
    }

    async fillOtpCode(code: string) {
        for (let i = 0; i < code.length; i++) {
            await this.otpInputs.nth(i).fill(code![i]);
        }
    }
}