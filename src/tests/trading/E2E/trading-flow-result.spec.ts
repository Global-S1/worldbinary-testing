import { test } from '../../../common/fixture-base';
import { ASSET_TYPE, PAIR, TIME, INVESTMENT, TYPE_OPERATION } from '../../../config/params';

test('Registro de la compra-venta y verificación del balance', async ({
    tradingPage,
    historyPage
}) => {
    await tradingPage.openApplication();
    await tradingPage.showBalanceBtn.click();
    await tradingPage.selectAccount();
    await tradingPage.setPair(ASSET_TYPE, PAIR);
    await tradingPage.setInvestment(INVESTMENT);
    await tradingPage.setTime(TIME);

    const initialBalance = await tradingPage.getBalance();
    console.log(`Initial Balance: ${initialBalance}`);
    const possibleGain = await tradingPage.getPossibleGain();
    console.log(`Possible Gain: ${possibleGain}`);
    const investment = await tradingPage.getInvestment();
    console.log(`Investment: ${investment}`);

    await tradingPage.startOperation(TYPE_OPERATION);
    const idOperation = await tradingPage.getInfoOperationOpen(PAIR);

    const balanceAfterOperation = await tradingPage.getBalance();
    console.log(`balance after operation: ${balanceAfterOperation}`);

    await historyPage.openApplication('open-operations');
    await historyPage.checkOperation(idOperation, 'open');

    await tradingPage.openApplication();
    await tradingPage.showBalanceBtn.click();
    await tradingPage.checkInfoOperationClosed(idOperation,TIME);

    const finalBalance = await tradingPage.getBalance();
    console.log(`final Balance: ${finalBalance}`);

    await tradingPage.checkBalance(
        initialBalance,
        balanceAfterOperation,
        investment,
        possibleGain,
        finalBalance
    );

    await historyPage.openApplication('closed-operations');
    await historyPage.checkOperation(idOperation, 'closed');
});
