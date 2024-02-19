import { PublicKey } from "@solana/web3.js";

export type Network = "MAINNET" | "DEVNET";

export const ADDRESSES = {
  MAINNET: {
    MPG_ID: new PublicKey("E9xDgYChJ6QP5xGRwoU6FtjWDXsnmoYu3DWECUU2fXAp"),
    DEX_ID: new PublicKey("BjpU1ACJY2bFj7aVTiMJLhM7H1ePxwkfDhjyY9dW9dbo"),
    INSTRUMENTS_ID: new PublicKey("VXD2JfYWTiLuQLZA4jXN58cCxQe1XhaquNHAA1FEDWW") ,
    FEES_ID : new PublicKey('2o2VABUDicRrLSzb5U4VvBrnVbtnDdCMowrMg9x7RGnD'),
    RISK_ID : new PublicKey('GW31SEFBLtoEhBYFJi2KUdmdnBG4xapjE7ARBWB5MQT2'),
    ORDERBOOK_P_ID : new PublicKey('Cet4WZvLjJJFfPCfFsGjH8aHHCLgoUWWYXXunf28eAFT'),
    PYTH_MAINNET : new PublicKey('H6ARHf6YXhGYeQfUzQNGk6rDNnLBQKrenN712K4AQJEG'),
    PYTH_DEVNET : new PublicKey('J83w4HKfqxwcq3BEMMkPFSppX3gqekLyLJBexebFVkix'),
    PRODUCTS: [
        {
            name: 'SOL-PERP',
            PRODUCT_ID: new PublicKey('ExyWP65F2zsALQkC2wSQKfR7vrXyPWAG4SLWExVzgbaW'),
            ORDERBOOK_ID: new PublicKey('Ggw9mU8vfP3NucANaPJBZSZMRSiMPrsvFmxj5wM3qvn3'),
            BIDS: new PublicKey('DmB2CBjeLAh6awvWvySuygSom1JHdT95ZVEQmZF4TBXD'),
            ASKS: new PublicKey('FPTSdA4vPQRz4KyjKi5YYdNNq9EbKDSgKMNyadrbVhG8'),
            EVENT_QUEUE: new PublicKey('2Kv94KZTX8yePkdNZT1zXpzDaTpLYLpeiv7Gp8vLA6kL'),
            tick_size: 100,
            decimals: 5
        }
    ],
    VAULT_MINT: new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"),
    BUDDYLINK_PROGRAM_ID: new PublicKey("BUDDYtQp7Di1xfojiCSVDksiYLQx511DPdj2nbtG9Yu5"),
    VAULT_SEED : 'market_vault',
    FEES_SEED : 'fee_model_config_acct',
    TRADER_FEE_ACCT_SEED : 'trader_fee_acct',
  },
  DEVNET: {
    MPG_ID: new PublicKey("GSiRLUGwJsPn3RVozE6auGyTMZ8cg9c7HnAtTKzeb4Z8"),
    DEX_ID: new PublicKey("BjpU1ACJY2bFj7aVTiMJLhM7H1ePxwkfDhjyY9dW9dbo"),
    INSTRUMENTS_ID: new PublicKey("VXD2JfYWTiLuQLZA4jXN58cCxQe1XhaquNHAA1FEDWW") ,
    FEES_ID : new PublicKey('2o2VABUDicRrLSzb5U4VvBrnVbtnDdCMowrMg9x7RGnD'),
    RISK_ID : new PublicKey('GW31SEFBLtoEhBYFJi2KUdmdnBG4xapjE7ARBWB5MQT2'),
    ORDERBOOK_P_ID : new PublicKey('Cet4WZvLjJJFfPCfFsGjH8aHHCLgoUWWYXXunf28eAFT'),
    PYTH_MAINNET : new PublicKey('H6ARHf6YXhGYeQfUzQNGk6rDNnLBQKrenN712K4AQJEG'),
    PYTH_DEVNET : new PublicKey('J83w4HKfqxwcq3BEMMkPFSppX3gqekLyLJBexebFVkix'),
    PRODUCTS: [
        {
            name: 'SOL-PERP',
            PRODUCT_ID: new PublicKey('DUCFhVbomXJHZFJPdgYEQVtBGfADon9qDMTE2hbnzi26'),
            ORDERBOOK_ID: new PublicKey('7xiz1kHfapP65m5dYjgt2uVV7RqBFcFa3kxvqrRTGjz3'),
            BIDS: new PublicKey('DP5fvyaV8bDGTTntrqFjZ2Z1xek21z16x8KfhBsrCTBb'),
            ASKS: new PublicKey('DJkXtHhwzRiwpz3oDu3SJbj3VPHTHhiLjqqBQM5FtSBj'),
            EVENT_QUEUE: new PublicKey('Aj7T65BVGVHSfcKv3A52ZG8y6FQiEMUSipgyCHbosAZN'),
            tick_size: 100,
            decimals: 5
        }
    ],
    VAULT_MINT: new PublicKey("Bg2f3jstf2Co4Hkrxsn7evzvRwLbWYmuzaLUPGnjCwAA"),
    BUDDYLINK_PROGRAM_ID: new PublicKey("BUDDYtQp7Di1xfojiCSVDksiYLQx511DPdj2nbtG9Yu5"),
    VAULT_SEED : 'market_vault',
    FEES_SEED : 'fee_model_config_acct',
    TRADER_FEE_ACCT_SEED : 'trader_fee_acct',
  }
};

export const API_BASE = "http://localhost:4000"
export const TRADE_HISTORY = "/perps-apis/getTradeHistory"

