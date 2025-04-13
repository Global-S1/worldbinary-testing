import { Locator, Page } from "@playwright/test";
import { PageBase } from "../../../common/page-base";

export class TradingPage extends PageBase {
    readonly showBalanceBtn: Locator;
    readonly balanceText: Locator;
    
    constructor(page: Page) {
        super(page, 'trading');
        this.showBalanceBtn = page.locator("header").getByRole('button').filter({ hasText: /^$/ }).nth(1);
        this.balanceText = page.locator("header").getByText('$');
    }

    async buy() {
        await this.showBalanceBtn.click();
        await this.page.waitForTimeout(5000); 
        const balanceText = await this.balanceText.innerText();
        console.log(`Balance Text: ${balanceText}`);
        const balance = parseFloat(balanceText.replace(/[^0-9.-]+/g, "")); 
        console.log(`Balance: ${balance}`); 
    }

    async sell() {
    }
}