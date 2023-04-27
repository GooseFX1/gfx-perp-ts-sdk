import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { MarketProductGroup } from "../layout";
import { AnchorProvider, Program, Wallet } from "@project-serum/anchor";
import dexIdl from "../idl/dex.json";
import { ADDRESSES } from "../constants";

export type NetworkType = "devnet" | "mainnet";
export type TradeSide = "buy" | "sell"
export type OrderType = 'limit' | 'market' | 'immediateOrCancel' | 'postOnly'

export class Perp {
  marketProductGroup: MarketProductGroup;
  connection: Connection;
  program: Program;
  wallet: Wallet;
  networkType: NetworkType;

  constructor(
    connection: Connection,
    networkType: NetworkType,
    wallet: Wallet,
    mpg?: MarketProductGroup
  ) {
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
    this.connection = connection;
    this.networkType = networkType;
    if (mpg) this.marketProductGroup = mpg;
  }

  async init() {
    const mpgId =
      this.networkType === "mainnet"
        ? ADDRESSES.MAINNET.MPG_ID
        : ADDRESSES.DEVNET.MPG_ID;
    const mpg = await MarketProductGroup.fetch(this.connection, mpgId);
    this.marketProductGroup = mpg![0];
  }
}
