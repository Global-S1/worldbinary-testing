import { test as baseTest } from '@playwright/test';
import { AuthLoginPage } from '../modules/auth/pages/auth-login.page';
import { TradingPage } from '../modules/trading/pages/trading.page';
import { AuthRegisterPage } from '../modules/auth/pages/auth-register.page';

type FixtureBase = {
    loginPage: AuthLoginPage;
    registerPage: AuthRegisterPage;
    tradingPage: TradingPage;
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
});

export { expect } from '@playwright/test';