import { test } from '../../../common/fixture-base';

test('Registro de la compra-venta y verificación del balance', async ({
    tradingPage,
    historyPage
}) => {
    await tradingPage.openApplication();
    await tradingPage.showBalanceBtn.click();
    await tradingPage.setPair(process.env.ASSET_TYPE || '', process.env.PAIR || '');

    await tradingPage.setInvestment(Number(process.env.INVESTMENT )|| 0);
    await tradingPage.setTime(process.env.TIME || '');

    const initialBalance = await tradingPage.getBalance();
    console.log(`Initial Balance: ${initialBalance}`);
    const possibleGain = await tradingPage.getPossibleGain();
    console.log(`Possible Gain: ${possibleGain}`);
    const investment = await tradingPage.getInvestment();
    console.log(`Investment: ${investment}`);

    await tradingPage.startOperation(process.env.TYPE_OPERATION || '');
    const idOperation = await tradingPage.getInfoOperationOpen(process.env.PAIR || '');

    const balanceAfterOperation = await tradingPage.getBalance();
    console.log(`balance after operation: ${balanceAfterOperation}`);

    await historyPage.openApplication('open-operations');
    await historyPage.checkOperation(idOperation, 'open');

    await tradingPage.openApplication();
    await tradingPage.showBalanceBtn.click();
    await tradingPage.checkInfoOperationClosed(idOperation, process.env.TIME || '');

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
