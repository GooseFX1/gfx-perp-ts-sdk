import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { MarketProductGroup } from "../layout";
import { AnchorProvider, Program, Wallet } from "@project-serum/anchor";
import dexIdl from "../idl/dex.json";
import { ADDRESSES } from "../constants";
import { Side } from "./orderbook/event_queue";

export type NetworkType = "devnet" | "mainnet";
export type TradeSide = "buy" | "sell";
export type OrderType = "limit" | "market" | "immediateOrCancel" | "postOnly";
export type ConstantIDs = {
  MPG_ID: PublicKey;
  DEX_ID: PublicKey;
  INSTRUMENTS_ID: PublicKey;
  FEES_ID: PublicKey;
  RISK_ID: PublicKey;
  ORDERBOOK_P_ID: PublicKey;
  PYTH_MAINNET: PublicKey;
  PYTH_DEVNET: PublicKey;
  PRODUCTS: {
    name: string;
    PRODUCT_ID: PublicKey;
    ORDERBOOK_ID: PublicKey;
    BIDS: PublicKey;
    ASKS: PublicKey;
    EVENT_QUEUE: PublicKey;
    tick_size: number;
    decimals: number;
  }[];
  VAULT_MINT: PublicKey;
  BUDDYLINK_PROGRAM_ID: PublicKey;
  VAULT_SEED: string;
  FEES_SEED: string;
  TRADER_FEE_ACCT_SEED: string;
};

export type Trade = {
  side: Side;
  orderId: string;
  taker: string;
  maker: string;
  price: number;
  qty: number;
  time: number;
  takerCallbackId: number;
  makerCallbackId: number;
  tradeId: number;
}

export class Perp {
  marketProductGroup: MarketProductGroup;
  mpgBytes: Buffer;
  connection: Connection;
  program: Program;
  wallet: Wallet;
  wallet_public_key: PublicKey;
  networkType: NetworkType;
  ADDRESSES: ConstantIDs;

  constructor(
    connection: Connection,
    networkType: NetworkType,
    wallet?: Wallet,
    mpg?: MarketProductGroup,
    mpgBytes?: Buffer,
    wallet_address?: PublicKey
  ) {
    if (!wallet && !wallet_address) {
        throw new Error(
            "Either wallet or wallet_address must be provided"
        );
    }
    if (wallet && wallet_address) {
        throw new Error(
            "Either wallet or wallet_address must be provided but not both"
        );
    }
    this.wallet_public_key = wallet ? wallet.publicKey : wallet_address;
    if (wallet) {
        this.wallet = wallet;
        const provider = new AnchorProvider(
            connection,
            this.wallet,
            AnchorProvider.defaultOptions()
        );
        this.program = new Program(
            dexIdl as any,
            dexIdl.metadata.address,
            provider
        );
    }
    this.connection = connection;
    this.networkType = networkType;
    if (this.networkType === "mainnet") {
      this.ADDRESSES = ADDRESSES.MAINNET;
    } else if (this.networkType === "devnet") {
      this.ADDRESSES = ADDRESSES.DEVNET;
    }
    if (mpg) this.marketProductGroup = mpg;
    if (mpgBytes) this.mpgBytes = mpgBytes;
  }

  async init() {
    const mpgId = this.ADDRESSES.MPG_ID
    const mpg = await MarketProductGroup.fetch(this.connection, mpgId);
    this.marketProductGroup = mpg![0];
    this.mpgBytes = mpg[1].data;
  }
}
