import { expect } from '../common/fixture-base';
import { Locator, Page } from "@playwright/test";
import { PageBase } from "../common/page-base";

export class HistoryPage extends PageBase {
    readonly openOperationItem: Locator;

    constructor(page: Page) {
        super(page, 'trading-history');
        this.openOperationItem = page.locator('tbody')
    }

    async checkOperation(idOperation: string | undefined, statusOperation: string) {
        await expect(this.openOperationItem.getByRole('cell', { name: idOperation })).toBeVisible();

        const statusText = statusOperation === 'open'
            ? 'operaciones abiertas'
            : 'operaciones cerradas';

        console.log(`✅ Se encontró el Operation ID ${idOperation} dentro del historial de ${statusText}`);
    }
}