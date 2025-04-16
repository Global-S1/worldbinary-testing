import { Locator, Page } from '@playwright/test';

export class YopmailPage {
    readonly page: Page;
    readonly emailInput: Locator;
    readonly checkInboxButton: Locator;
    readonly emailFrame: Locator;
    
    constructor(page: Page) {
        this.page = page;
        this.emailInput = page.locator('input#login');
        this.checkInboxButton = page.getByRole('button', { name: '' });
        this.emailFrame = page.locator('iframe[name="ifmail"]');
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
        
        const fullText = await frame.getByText('2FA Сode:').innerText();
        const code = fullText.match(/\d{6}/)?.[0];
        
        if (!code) throw new Error('2FA code not found in email');
        return code;
    }
    
    async bringToFront() {
        await this.page.bringToFront();
    }
}