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
            decimals: 7
        }
    ],
    VAULT_MINT: new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"),
    BUDDYLINK_PROGRAM_ID: new PublicKey("BUDDYtQp7Di1xfojiCSVDksiYLQx511DPdj2nbtG9Yu5"),
    VAULT_SEED : 'market_vault',
    FEES_SEED : 'fee_model_config_acct',
    TRADER_FEE_ACCT_SEED : 'trader_fee_acct',
  },
  DEVNET: {
    MPG_ID: new PublicKey("6jT2d44kD7WLtaFBHYWhzQ18MtP9dQD5ewWf9zg5ys4P"),
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
            PRODUCT_ID: new PublicKey('3VvYzfCvFVZgmDr4CyMPAqigccqLiXk3XCXMUzfk8biV'),
            ORDERBOOK_ID: new PublicKey('7mV1Vn6YjK2GNbMCYo4vTVd5NuKxGYdgTxVPZhx9xvZz'),
            BIDS: new PublicKey('ATM4v6kum8vjMG7TXxepo2nBHunesJQxagQWoyKeWdrR'),
            ASKS: new PublicKey('8YVrzgBYqeK5sgj2TBGJaA3pLR7sZBHfGVKuVK9mANrr'),
            EVENT_QUEUE: new PublicKey('5T5Y9E8eyP3eddFbwgt4BSEwgaZY7B5pBQ1TqjQ4q9r6'),
            tick_size: 100,
            decimals: 5
        }
    ],
    VAULT_MINT: new PublicKey("3Q6dz8cLd4BW1kyuGyUaS7qhTtFP7tGS55Y7fybCUfNy"),
    BUDDYLINK_PROGRAM_ID: new PublicKey("BUDDYtQp7Di1xfojiCSVDksiYLQx511DPdj2nbtG9Yu5"),
    VAULT_SEED : 'market_vault',
    FEES_SEED : 'fee_model_config_acct',
    TRADER_FEE_ACCT_SEED : 'trader_fee_acct',
  }
};

export const API_BASE = "https://api-services.goosefx.io"
export const TRADE_HISTORY = "/perps-apis/getTradeHistory"
export const FUNDING_RATE_HISTORY = "/perps-apis/getFundingRateHistory"

