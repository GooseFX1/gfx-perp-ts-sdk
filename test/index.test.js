const { Wallet } = require('@project-serum/anchor')
const { Connection, Keypair } = require('@solana/web3.js')
const { Perp, Product } = require('gfx-perp-sdk')

const connection = new Connection("https://solana-api.syndica.io/access-token/uekcYQXufiP6U54AuGKFjzUtiuhIfPWuTh0XXfvL0wYJFAG8kTgcsrs0PbJQkFcm/rpc")
const walletKeys = new Uint8Array([])
const wall = new Wallet(Keypair.fromSecretKey(walletKeys))
test('Test initialization', async () => {
  const perpObj = new Perp(connection, 'mainnet', wall)
  
  expect(perpObj.wallet).not.toBeUndefined()
  expect(perpObj.connection).not.toBeUndefined()
  expect(perpObj.networkType).not.toBeUndefined()
  expect(perpObj.program).not.toBeUndefined()
  expect(perpObj.marketProductGroup).toBeUndefined()

  await perpObj.init()

  expect(perpObj.marketProductGroup).not.toBeUndefined()
})

test('Test orderbook L2', async () => {
  const perpObj = new Perp(connection, 'mainnet', wall)
  await perpObj.init()
  const product = new Product(perpObj)
  product.initByIndex(0)
  const orderbook = await product.getOrderbookL2()
  expect(orderbook.bids.length).toBeGreaterThanOrEqual(0)
  expect(orderbook.asks.length).toBeGreaterThanOrEqual(0)
})

test('Test orderbook L3', async () => {
  const perpObj = new Perp(connection, 'mainnet', wall)
  await perpObj.init()
  const product = new Product(perpObj)
  product.initByIndex(0)
  const orderbook = await product.getOrderbookL3()
  expect(orderbook.bids.length).toBeGreaterThanOrEqual(0)
  expect(orderbook.asks.length).toBeGreaterThanOrEqual(0)
})


