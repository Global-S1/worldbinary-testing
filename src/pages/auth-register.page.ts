import { Locator, Page } from '@playwright/test';
import { PageBase } from '../common/page-base';

export class AuthRegisterPage extends PageBase {
    readonly emailInput: Locator;
    readonly firstNameInput: Locator;
    readonly lastNameInput: Locator;
    readonly countrySelect: Locator;
    readonly countryOption: (countryName: string) => Locator;
    readonly passwordInput: Locator;
    readonly acceptTermsCheckbox: Locator;
    readonly acceptCookiesCheckbox: Locator;
    readonly submitButton: Locator;

    constructor(page: Page) {
        super(page, 'auth/register');
        this.emailInput = page.locator('input[name="email"]');
        this.firstNameInput = page.locator('input[name="firstName"]');
        this.lastNameInput = page.locator('input[name="lastName"]');
        this.countrySelect = page.locator('div').filter({ hasText: /^Select your country$/ });
        this.countryOption = (countryName: string) => page.getByText(countryName);
        this.passwordInput = page.locator('input[name="password"]');
        this.acceptTermsCheckbox = page.locator('input[name="acceptTermsOfUseAndPrivacyPolicies"]');
        this.acceptCookiesCheckbox = page.locator('input[name="acceptCookiesPolicies"]');
        this.passwordInput = page.locator('input[name="password"]');
        this.submitButton = page.locator('button[type="submit"]');
    }

    async selectCountry(countryName: string) {
        await this.countrySelect.click();
        await this.countryOption(countryName).click();
    }

    async register(
        emailValue: string, 
        firstName: string, 
        passwordValue: string, 
        countryName: string,
        acceptTerms: boolean,
        acceptCookies: boolean
    ) {
        await this.emailInput.fill(emailValue);
        await this.firstNameInput.fill(firstName); 
        await this.lastNameInput.fill('_test');
        await this.selectCountry(countryName);
        await this.passwordInput.fill(passwordValue);

        if (acceptTerms)    await this.acceptTermsCheckbox.check();
        if (acceptCookies)  await this.acceptCookiesCheckbox.check();

        if(acceptCookies && acceptTerms) {
        await this.submitButton.click();
        }
    }
}