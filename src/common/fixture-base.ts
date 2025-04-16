import { test as baseTest } from '@playwright/test';
import { AuthLoginPage } from '../pages/auth.page';
import { TradingPage } from '../pages/trading.page';
import { AuthRegisterPage } from '../pages/auth-register.page';
import { HistoryPage } from '../pages/history.page';

type FixtureBase = {
    loginPage: AuthLoginPage;
    registerPage: AuthRegisterPage;
    tradingPage: TradingPage;
    historyPage: HistoryPage;
}

export const test = baseTest.extend<FixtureBase>({
    loginPage: async ({ page }, use) => {
        await use(new AuthLoginPage(page));
    },
    registerPage: async ({ page }, use) => {
        await use(new AuthRegisterPage(page));
    },
    tradingPage: async ({ page }, use) => {
        await use(new TradingPage(page));
    },
    historyPage: async ({ page }, use) => {
        await use(new HistoryPage(page));
    },
});

export { expect } from '@playwright/test';