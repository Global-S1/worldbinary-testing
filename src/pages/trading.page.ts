import { Locator, Page } from "@playwright/test";
import { PageBase, } from "../common/page-base";
import { expect } from '../common/fixture-base';
import { fechaLocal } from "../utils/getDate";

export class TradingPage extends PageBase {
    readonly showBalanceBtn: Locator;
    readonly desplayTypeAccount: Locator;
    readonly selectTypeAccount: Locator;
    readonly balanceText: Locator;
    readonly pairListBtn: Locator;
    readonly pairType: Locator;
    readonly pairItem: Locator;
    readonly investmentInput: Locator;
    readonly timeInput: Locator;
    readonly predefinedTimeInput: Locator;
    readonly possibleGainText: Locator;
    readonly buyBtn: Locator;
    readonly sellBtn: Locator;
    readonly showOperationsBtn: Locator;
    readonly openOperationBtn: Locator;
    readonly idOperation: Locator;
    readonly ClosedOperationBtn: Locator;
    readonly listOperationToDay: Locator;
    readonly containerOperations: Locator;

    constructor(page: Page) {
        super(page, 'trading');
        this.showBalanceBtn = page.locator("header").getByRole('button').filter({ hasText: /^$/ }).nth(1);
        this.desplayTypeAccount = page.locator('header').getByRole('img').nth(1);
        this.selectTypeAccount = page.getByRole('listitem');
        this.balanceText = page.locator("header").getByText('$');
        this.pairListBtn = page.locator('#dropdownSearchButton');
        this.pairType = page.getByRole('listitem');
        this.pairItem = page.locator("#dropdownSearch");
        this.investmentInput = page.locator('div').filter({ hasText: /^-$/ }).getByRole('textbox');
        this.timeInput = page.locator('div').getByText('-::');
        this.predefinedTimeInput = page.locator('div');
        this.possibleGainText = page.locator('div').getByText('+$');
        this.buyBtn = page.locator('#up');
        this.sellBtn = page.locator('#down');
        this.showOperationsBtn = page.locator('div').getByRole('button', { name: /Ver operaciones|See operations/i });
        this.openOperationBtn = page.locator('div');
        this.idOperation = page.getByText(/Operation ID: \d+/, { exact: false });
        this.ClosedOperationBtn = page.getByRole('button', { name: 'Closed' })
        this.listOperationToDay = page.getByText(fechaLocal);
        this.containerOperations = page.locator('div.flex.flex-col.gap-3');
    }

    async selectAccount(){
        await this.desplayTypeAccount.click();
        await this.page.waitForTimeout(2000);
        await this.selectTypeAccount.filter({ hasText: 'Demo account$' }).locator('div').first().click();
    }

    async getBalance() {
        const balanceText = await this.balanceText.innerText();
        const balance = parseFloat(balanceText.replace(/[^0-9.-]+/g, ""));
        return balance;
    }

    async setPair(type: string, pair: string) {
        await this.pairListBtn.click();
        await this.page.waitForTimeout(2000);
        await this.pairType.filter({ hasText: new RegExp(`^${type}$`, 'i') }).click();
        await this.pairItem.getByText(pair).click();
        await this.page.waitForTimeout(2000);
    }

    async setInvestment(investment: number) {
        await this.investmentInput.click();
        await this.page.waitForTimeout(1000);
        await this.investmentInput.fill(investment.toString());
        await this.page.waitForTimeout(2000);
    }
    async setTime(time: string) {
        await this.timeInput.click();
        await this.page.waitForTimeout(1000);
        await this.predefinedTimeInput.getByRole('button', { name: time }).click();
    }

    async getPossibleGain() {
        await this.page.waitForTimeout(1000);
        const possibleGainText = await this.possibleGainText.innerText();
        const possibleGain = parseFloat(possibleGainText.replace(/[^0-9.-]+/g, ""));
        return possibleGain;
    }

    async getInvestment() {
        const investment = await this.investmentInput.inputValue();
        return parseFloat(investment);
    }

    async startOperation(operartion: string) {
        const initialBalance = await this.getBalance();
        const investment = await this.getInvestment();

        (operartion === 'buy') ? await this.buyBtn.click() : await this.sellBtn.click();
        await this.page.waitForTimeout(2000);

        const balanceFinal = await this.getBalance();

        if (balanceFinal === initialBalance - investment) {
            console.log("Operation in progress, investment deducted from balance✅");
        }
    }

    async getInfoOperationOpen(pair: string) {
        await this.showOperationsBtn.click();
        await this.page.waitForTimeout(2000);
        await this.openOperationBtn.getByRole('heading', { name: pair }).click();
        const text = await this.idOperation.innerText();
        const operationId = text.match(/\d+/)?.[0];
        console.log('Operation opening ID:', operationId);
        return operationId;
    }

    async checkInfoOperationClosed(idOperation: string | undefined, time: string) {
        await this.showOperationsBtn.click();
        await this.page.waitForTimeout(2000);
        await this.ClosedOperationBtn.click();
        await this.listOperationToDay.click();

        const firstItem = this.containerOperations.locator('div.rounded-lg.p-2.border').first();

        const timeInMinutes = parseInt(time.replace('m', ''));
        const timeout = (timeInMinutes * 60 + 2) * 1000; 

        console.log(`⏳ Esperando ${timeout / 1000} segundos para que la operación cierre...`);
        await this.page.waitForTimeout(timeout);

        console.log("Operación ha cerrado");
        const firstItemText = await firstItem.textContent();
        if (firstItemText?.includes(idOperation!)) {
            console.log(`✅ Se encontró el Operation ID ${idOperation} dentro de las operaciones cerradas del día`);
        } else {
            console.log(`❌ No se encontró el Operation ID ${idOperation} dentro de las operaciones cerradas del día`);
        }
    }

    async checkBalance(
        initialBalance: number,
        balanceAfterOperation: number,
        investment: number,
        possibleGain: number,
        finalBalance: number
    ) {
        const firstItem = this.containerOperations.locator('div.rounded-lg.p-2.border').first();
        const firstItemText = await firstItem.textContent();
        if (firstItemText?.includes('Result:') && firstItemText.includes('Win')) {
            console.log('📈 La operación fue ganadora.');
            const expectedFinalBalance = balanceAfterOperation + investment + possibleGain;
            expect(finalBalance).toBeCloseTo(expectedFinalBalance);
        } else if (firstItemText?.includes('Result:') && firstItemText.includes('Lose')){
            console.log('📉 No fue una operación ganadora.');
            const expectedFinalBalance = initialBalance - investment;
            expect(finalBalance).toBeCloseTo(expectedFinalBalance);
        }else if (firstItemText?.includes('Result:') && firstItemText.includes('Draw')){
            console.log('🟰 la operación quedó en empate.');
            const expectedFinalBalance = initialBalance;
            expect(finalBalance).toBeCloseTo(expectedFinalBalance);
        }
    }
}