import { Locator, Page } from '@playwright/test';

export class YopmailPage {
    readonly page: Page;
    readonly emailInput: Locator;
    readonly checkInboxButton: Locator;
    readonly emailFrame: Locator;
    readonly buttonRefresh: Locator;
    
    constructor(page: Page) {
        this.page = page;
        this.emailInput = page.locator('input#login');
        this.checkInboxButton = page.getByRole('button', { name: '' });
        this.emailFrame = page.locator('iframe[name="ifmail"]');
        this.buttonRefresh = page.locator('#refresh');
    }
    
    async open() {
        await this.page.goto('https://yopmail.com/es/');
    }
    
    async checkInbox(email: string) {
        await this.emailInput.fill(email);
        await this.checkInboxButton.click();
        await this.page.waitForTimeout(4000);
    }
    
    async get2FACode() {
        const frame = await this.emailFrame.contentFrame();
        if (!frame) throw new Error('Email frame not found');
        await this.buttonRefresh.waitFor({ state: 'visible', timeout: 10000 });
        await this.buttonRefresh.click({ force: true });
        const fullText = await frame.getByText('2FA Сode:').innerText();
        const code = fullText.match(/\d{6}/)?.[0];
        
        if (!code) throw new Error('2FA code not found in email');
        return code;
    }

    async verifyAccount() {
        const frame = this.emailFrame.contentFrame();
        if (!frame) throw new Error('Email frame not found');
        this.buttonRefresh.click();
        const confirmationLinkLocator = frame.getByRole('link', { name: 'Confirmar Cuenta' });
        if (await confirmationLinkLocator.isVisible()) {
            await confirmationLinkLocator.click();
        } else {
            throw new Error('Confirmation link not found in email');
        }
    }

    async runForLogin(email: string): Promise<string> {
        await this.open(); 
        await this.checkInbox(email); 
        const code = await this.get2FACode(); 
        return code;
    }
}