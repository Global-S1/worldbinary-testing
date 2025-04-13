import { test } from '../../../common/fixture-base';

test('Compra de un par de divisas', async ({
    tradingPage
}) => {
    await tradingPage.openApplication();
    await tradingPage.buy();
});
