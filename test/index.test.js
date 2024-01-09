const { Wallet } = require('@project-serum/anchor')
const { Connection, Keypair, Transaction, sendAndConfirmTransaction } = require('@solana/web3.js')
const { BN } = require('bn.js')
const { Perp, Product, Trader } = require('gfx-perp-sdk')
const { Fractional } = require('gfx-perp-sdk/dist/types')

const connection = new Connection("rpc-url here")
const walletKeys = new Uint8Array([])
const kp = Keypair.fromSecretKey(walletKeys)
const wall = new Wallet(kp)

xtest('Test initialization', async () => {
  const perp = new Perp(connection, 'mainnet', wall)
  
  expect(perp.wallet).not.toBeUndefined()
  expect(perp.connection).not.toBeUndefined()
  expect(perp.networkType).not.toBeUndefined()
  expect(perp.program).not.toBeUndefined()
  expect(perp.marketProductGroup).toBeUndefined()

  await perp.init()

  expect(perp.marketProductGroup).not.toBeUndefined()
})

xtest('Test get orderbook L2', async () => {
  const perp = new Perp(connection, 'mainnet', wall)
  await perp.init()
  const product = new Product(perp)
  product.initByIndex(0)
  const orderbook = await product.getOrderbookL2()
  expect(orderbook.bids.length).toBeGreaterThanOrEqual(0)
  expect(orderbook.asks.length).toBeGreaterThanOrEqual(0)
})

xtest('Test get orderbook L3', async () => {
  const perp = new Perp(connection, 'mainnet', wall)
  await perp.init()
  const product = new Product(perp)
  product.initByIndex(0)
  const orderbook = await product.getOrderbookL3()
  expect(orderbook.bids.length).toBeGreaterThanOrEqual(0)
  expect(orderbook.asks.length).toBeGreaterThanOrEqual(0)
})

function sleep(n) { return new Promise(resolve=>setTimeout(resolve,n)); }

xtest('Test orderbook bids subscription', async () => {
  const perp = new Perp(connection, 'mainnet', wall)
  await perp.init()
  const product = new Product(perp)
  product.initByIndex(0)
  async function handleAccountChange(e){
    console.log("event notification e: ", e)
  }
  const subscribeId = product.subscribeToBids((e) => handleAccountChange(e))
  await sleep(100*1000)
  connection.removeAccountChangeListener(subscribeId)
}, 100*1000)

xtest('Test trade subscription', async () => {
  const perp = new Perp(connection, 'mainnet', wall)
  await perp.init()
  const product = new Product(perp)
  product.initByIndex(0)
  async function handleAccountChange(e){
    console.log("event notification: ", e)
  }
  const subscribeId = product.subscribeToTrades((e) => handleAccountChange(e))
  await sleep(100*1000)
  connection.removeAccountChangeListener(subscribeId)
}, 100*1000)

xtest('Test initializing new Trader Account', async() => {
  const perp = new Perp(connection, 'mainnet', wall)
  await perp.init()
  const trader = new Trader(perp)
  const [ixs, signers] = await trader.createTraderAccountIxs()
  const tr = new Transaction()
  ixs.map(ix => tr.add(ix))
  const res = await sendAndConfirmTransaction(connection, tr, [kp, ...signers], {commitment: "processed"})
  console.log("res: ", res)
}, 30*1000)

xtest('Test deposit funds', async () => {
  const perp = new Perp(connection, 'mainnet', wall)
  await perp.init()
  const trader = new Trader(perp)
  await trader.init()
  const ix = await trader.depositFundsIx(new Fractional({
    m: new BN(1),
    exp: new BN(0)
  }))
  const tr = new Transaction()
  tr.add(ix)
  const res = await sendAndConfirmTransaction(connection, tr, [kp], {commitment: "processed"})
  console.log("res is: ", res)
}, 30*1000)

xtest('Test withdraw funds', async () => {
  const perp = new Perp(connection, 'mainnet', wall)
  await perp.init()
  const trader = new Trader(perp)
  await trader.init()
  const ix = await trader.withdrawFundsIx(new Fractional({
    m: new BN(1),
    exp: new BN(0)
  }))
  const tr = new Transaction()
  tr.add(ix)
  const res = await sendAndConfirmTransaction(connection, tr, [kp], {commitment: "processed"})
  console.log("res is: ", res)
}, 30*1000)

xtest("Test new Order", async () => {
  const perp = new Perp(connection, "mainnet", wall);
  await perp.init();
  const product = new Product(perp);
  product.initByIndex(0);
  const trader = new Trader(perp);
  await trader.init();
  const ix = await trader.newOrderIx(
    new Fractional({
      m: new BN(1000),
      exp: new BN(0),
    }),
    new Fractional({
      m: new BN(1),
      exp: new BN(0),
    }),
    "buy",
    "limit",
    product
  );
  const tr = new Transaction();
  tr.add(ix);
  const res = await sendAndConfirmTransaction(connection, tr, [kp],{ commitment: "processed"});
  console.log("res is: ", res);
}, 30*1000);

xtest("Test cancel Order", async () => {
  const perp = new Perp(connection, "mainnet", wall);
  await perp.init();
  const product = new Product(perp);
  product.initByIndex(0);
  const trader = new Trader(perp);
  await trader.init();
  const ix = await trader.cancelOrderIx("7922816251444880503428103912726", product);
  const tr = new Transaction();
  tr.add(ix);
  const res = await sendAndConfirmTransaction(connection, tr, [kp],{ commitment: "processed"});
  console.log("res is: ", res);
}, 30*1000);

xtest('Get Open orders for trader', async() => {
  const perp = new Perp(connection, 'devnet', wall)
  await perp.init()
  const product = new Product(perp);
  product.initByIndex(0);
  const trader = new Trader(perp)
  await trader.init();
  const orderbookData = await trader.getOpenOrders(product)
  console.log("orderbook: ", orderbookData)
})

xtest('Get Trader details', async() => {
  const perp = new Perp(connection, 'devnet', wall)
  await perp.init()
  const trader = new Trader(perp)
  await trader.init();
  console.log("Total Deposited: ", trader.totalDeposited)
  console.log("Total Withdrawn: ", trader.totalWithdrawn)
  console.log("Margin Available: ", trader.marginAvailable)
  console.log("Total Traded Volume: ", trader.totalTradedVolume)
  console.log("Active Positions: ", trader.traderPositions)
})

test('Close trader risk group account', async() => {
  const perp = new Perp(connection, 'mainnet', wall)
  await perp.init()
  const trader = new Trader(perp)
  const traderAddresses = await trader.getAllTraderAddresses()
  console.log(traderAddresses)
}, 30*1000)

xtest('Close trader risk group account', async() => {
  const perp = new Perp(connection, 'mainnet', wall)
  await perp.init()
  const trader = new Trader(perp)
  await trader.init()
  const ix = await trader.closetrgIx()
  const tr = new Transaction()
  tr.add(ix)
  const res = await sendAndConfirmTransaction(connection, tr, [kp], {commitment: "processed"})
  console.log("res is: ", res)
}, 30*1000)