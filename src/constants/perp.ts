import { PublicKey } from "@solana/web3.js";

export type Network = "MAINNET" | "DEVNET";

export const ADDRESSES = {
  MAINNET: {
    MPG_ID: new PublicKey("JCWvXRYxfEqV6vBasius1pBnvZHM1pcxi5Z68UhBoAYB"),
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
            PRODUCT_ID: new PublicKey('14ZciACGpRfFD1cnM8EqfnFkontUJAPDanWfojG3a64K'),
            ORDERBOOK_ID: new PublicKey('DBgPn36WaLuz9YW3QUssYFrUdffc9ZTghBKMC4kESU14'),
            BIDS: new PublicKey('5AX6UuMSotgRLQiwKaT1CU68v2L3Djs7rX6jwh9QBbG1'),
            ASKS: new PublicKey('13riJnSLztyYTA6zP25RunosQX4tN3r9cxQBBdZhWzZw'),
            EVENT_QUEUE: new PublicKey('22EYyAPkiegp7WP43NHrS7baqRD41EhPC45ifn7Y6jNk'),
            tick_size: 100,
            decimals: 5
        }
    ],
    VAULT_MINT: new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"),
    VAULT_SEED : 'market_vault',
    FEES_SEED : 'fee_model_config_acct',
    TRADER_FEE_ACCT_SEED : 'trader_fee_acct',
  },
  DEVNET: {
    MPG_ID: new PublicKey("JCWvXRYxfEqV6vBasius1pBnvZHM1pcxi5Z68UhBoAYB"),
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
            PRODUCT_ID: new PublicKey('14ZciACGpRfFD1cnM8EqfnFkontUJAPDanWfojG3a64K'),
            ORDERBOOK_ID: new PublicKey('DBgPn36WaLuz9YW3QUssYFrUdffc9ZTghBKMC4kESU14'),
            BIDS: new PublicKey('5AX6UuMSotgRLQiwKaT1CU68v2L3Djs7rX6jwh9QBbG1'),
            ASKS: new PublicKey('13riJnSLztyYTA6zP25RunosQX4tN3r9cxQBBdZhWzZw'),
            EVENT_QUEUE: new PublicKey('22EYyAPkiegp7WP43NHrS7baqRD41EhPC45ifn7Y6jNk'),
            tick_size: 100,
            decimals: 5
        }
    ],
    VAULT_MINT: new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"),
    VAULT_SEED : 'market_vault',
    FEES_SEED : 'fee_model_config_acct',
    TRADER_FEE_ACCT_SEED : 'trader_fee_acct',
  }
};

