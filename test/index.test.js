const { Wallet } = require('@project-serum/anchor')
const { simulateTransaction } = require('@project-serum/anchor/dist/cjs/utils/rpc')
const { Connection, Keypair, Transaction, sendAndConfirmTransaction } = require('@solana/web3.js')
const { BN } = require('bn.js')
const { Perp, Product, Trader } = require('gfx-perp-sdk')
const { Fractional } = require('gfx-perp-sdk/dist/types')

const connection = new Connection("https://solana-api.syndica.io/access-token/uekcYQXufiP6U54AuGKFjzUtiuhIfPWuTh0XXfvL0wYJFAG8kTgcsrs0PbJQkFcm/rpc")
const walletKeys = new Uint8Array([])
const kp = Keypair.fromSecretKey(walletKeys)
const wall = new Wallet(kp)

xtest('Test initialization', async () => {
  const perpObj = new Perp(connection, 'mainnet', wall)
  
  expect(perpObj.wallet).not.toBeUndefined()
  expect(perpObj.connection).not.toBeUndefined()
  expect(perpObj.networkType).not.toBeUndefined()
  expect(perpObj.program).not.toBeUndefined()
  expect(perpObj.marketProductGroup).toBeUndefined()

  await perpObj.init()

  expect(perpObj.marketProductGroup).not.toBeUndefined()
})

xtest('Test orderbook L2', async () => {
  const perpObj = new Perp(connection, 'mainnet', wall)
  await perpObj.init()
  const product = new Product(perpObj)
  product.initByIndex(0)
  const orderbook = await product.getOrderbookL2()
  expect(orderbook.bids.length).toBeGreaterThanOrEqual(0)
  expect(orderbook.asks.length).toBeGreaterThanOrEqual(0)
})

xtest('Test orderbook L3', async () => {
  const perpObj = new Perp(connection, 'mainnet', wall)
  await perpObj.init()
  const product = new Product(perpObj)
  product.initByIndex(0)
  const orderbook = await product.getOrderbookL3()
  expect(orderbook.bids.length).toBeGreaterThanOrEqual(0)
  expect(orderbook.asks.length).toBeGreaterThanOrEqual(0)
})

function sleep(n) { return new Promise(resolve=>setTimeout(resolve,n)); }

xtest('Test orderbook subscription', async () => {
  const perpObj = new Perp(connection, 'mainnet', wall)
  await perpObj.init()
  const product = new Product(perpObj)
  product.initByIndex(0)
  async function handleAccountChange(){
    const res = await product.getOrderbookL2()
    console.log("Updated orderbook: ", res)

  }
  const subscribeId = product.subscribeToOrderbook(handleAccountChange)
  await sleep(10*1000)
  connection.removeAccountChangeListener(subscribeId)
})

xtest('Test initializing new Trader Account', async() => {
  const perpObj = new Perp(connection, 'mainnet', wall)
  await perpObj.init()
  const trader = new Trader(perpObj)
  const [ixs, signers] = await trader.createTraderAccountIxs()
  const tr = new Transaction()
  ixs.map(ix => tr.add(ix))
  const res = await sendAndConfirmTransaction(connection, tr, [kp, ...signers])
  console.log("res: ", res)
})

xtest('Test deposit funds', async () => {
  const perpObj = new Perp(connection, 'mainnet', wall)
  await perpObj.init()
  const trader = new Trader(perpObj)
  await trader.init()
  const ix = await trader.depositFundsIx(new Fractional({
    m: new BN(1),
    exp: new BN(0)
  }))
  const tr = new Transaction()
  tr.add(ix)
  const res = await sendAndConfirmTransaction(connection, tr, [kp])
  console.log("res is: ", res)
})

xtest('Test withdraw funds', async () => {
  const perpObj = new Perp(connection, 'mainnet', wall)
  await perpObj.init()
  const trader = new Trader(perpObj)
  await trader.init()
  const ix = await trader.withdrawFundsIx(new Fractional({
    m: new BN(1),
    exp: new BN(0)
  }))
  const tr = new Transaction()
  tr.add(ix)
  const res = await sendAndConfirmTransaction(connection, tr, [kp])
  console.log("res is: ", res)
})

xtest("Test new Order", async () => {
  const perpObj = new Perp(connection, "mainnet", wall);
  await perpObj.init();
  const product = new Product(perpObj);
  product.initByIndex(0);
  const trader = new Trader(perpObj);
  await trader.init();
  const ix = await trader.newOrderIx(
    new Fractional({
      m: new BN(10000),
      exp: new BN(0),
    }),
    new Fractional({
      m: new BN(1),
      exp: new BN(0),
    }),
    "buy",
    10,
    "limit",
    product
  );
  const tr = new Transaction();
  tr.add(ix);
  const res = await sendAndConfirmTransaction(connection, tr, [kp]);
  console.log("res is: ", res);
});

xtest("Test cancel Order", async () => {
  const perpObj = new Perp(connection, "mainnet", wall);
  await perpObj.init();
  const product = new Product(perpObj);
  product.initByIndex(0);
  const trader = new Trader(perpObj);
  await trader.init();
  const ix = await trader.cancelOrderIx("7922816251444880503428103915457", product);
  const tr = new Transaction();
  tr.add(ix);
  const res = await sendAndConfirmTransaction(connection, tr, [kp]);
  console.log("res is: ", res);
});

test('Get Open orders for trader', async() => {
  const perpObj = new Perp(connection, 'mainnet', wall)
  await perpObj.init()
  const product = new Product(perpObj);
  product.initByIndex(0);
  const trader = new Trader(perpObj)
  await trader.init();
  const orderbookData = await trader.getOpenOrders(product)
  console.log("orderbook: ", orderbookData)
})