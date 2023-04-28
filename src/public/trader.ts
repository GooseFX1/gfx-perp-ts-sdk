import { Keypair, PublicKey, SystemProgram, TransactionInstruction } from "@solana/web3.js";
import { TraderRiskGroup } from "../layout";
import { Fractional } from "../types";
import {
  getFeeModelConfigAcct,
  getMpgVault,
  getOrderTypeEnum,
  getRiskAndFeeSigner,
  getRiskSigner,
  getTradeSideEnum,
  getTraderFeeAcct,
  getTrgAddress,
  getUserAta,
  initializeTraderFeeAcctIx,
} from "../utils";
import { Perp, TradeSide, OrderType } from "./base";
import {
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";
import { BN } from "bn.js";
import { Product } from "./product";

export class Trader extends Perp {
  traderRiskGroup: TraderRiskGroup | null;
  trgKey: PublicKey;
  userTokenAccount: PublicKey;
  marketProductGroupVault: PublicKey;

  constructor(perp: Perp) {
    super(
      perp.connection,
      perp.networkType,
      perp.wallet,
      perp.marketProductGroup
    );
  }

  async getOpenOrders(product: Product) {
    if (!this.trgKey)
      throw new Error(
        "Trader account not initialised! If you have already created a Trader account, run init(). If not, run createTraderAccountIxs() to create the Trader account!"
      );
    const orderbookL3 = await product.getOrderbookL3();
    const filteredBids = orderbookL3.bids.filter(
      (item) => item.user === this.trgKey.toBase58()
    );
    const filteredAsks = orderbookL3.asks.filter(
      (item) => item.user === this.trgKey.toBase58()
    );
    return {
      bids: filteredBids,
      asks: filteredAsks,
    };
  }

  async createTraderAccountIxs(): Promise<
    [TransactionInstruction[], Keypair[]]
  > {
    const trgAddress = await getTrgAddress(
      this.wallet,
      this.connection,
      this.ADDRESSES.DEX_ID,
      this.ADDRESSES.MPG_ID
    );
    if (trgAddress) throw new Error("Trader already exists with this wallet!");
    const ixs = [];

    const initTrgAddress = Keypair.generate();
    const riskStateAccount = Keypair.generate();

    const traderFeeAcct = getTraderFeeAcct(
      initTrgAddress.publicKey,
      this.ADDRESSES.MPG_ID,
      this.ADDRESSES.FEES_ID,
      this.ADDRESSES.TRADER_FEE_ACCT_SEED
    );
    const userTokenAccount = await getUserAta(
      this.wallet.publicKey,
      this.ADDRESSES.VAULT_MINT
    );

    const res = await this.connection.getAccountInfo(userTokenAccount);
    if (!res) {
      ixs.push(
        createAssociatedTokenAccountInstruction(
          this.wallet.publicKey, // payer
          userTokenAccount, // ata
          this.wallet.publicKey, // owner
          this.ADDRESSES.VAULT_MINT // mint
        )
      );
    }
    ixs.push(
      initializeTraderFeeAcctIx({
        payer: this.wallet.publicKey,
        traderFeeAcct: traderFeeAcct,
        traderRiskGroup: initTrgAddress.publicKey,
        feeModelConfigAcct: getFeeModelConfigAcct(
          this.ADDRESSES.MPG_ID,
          this.ADDRESSES.FEES_ID,
          this.ADDRESSES.FEES_SEED
        ),
        MPG_ID: this.ADDRESSES.MPG_ID,
        FEES_ID: this.ADDRESSES.FEES_ID,
      })
    );

    ixs.push(
      SystemProgram.createAccount({
        fromPubkey: this.wallet.publicKey,
        newAccountPubkey: initTrgAddress.publicKey,
        lamports: await this.connection.getMinimumBalanceForRentExemption(
          13744
        ), //Need to change
        space: 13744, //Need to change
        programId: this.ADDRESSES.DEX_ID,
      })
    );
    ixs.push(
      await this.program.methods
        .initializeTraderRiskGroup()
        .accounts({
          owner: this.wallet.publicKey,
          traderRiskGroup: initTrgAddress.publicKey,
          marketProductGroup: this.ADDRESSES.MPG_ID,
          riskSigner: getRiskSigner(
            this.ADDRESSES.MPG_ID,
            this.ADDRESSES.DEX_ID
          ),
          traderRiskStateAcct: riskStateAccount.publicKey,
          traderFeeStateAcct: traderFeeAcct,
          riskEngineProgram: this.ADDRESSES.RISK_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([])
        .instruction()
    );
    return [ixs, [initTrgAddress, riskStateAccount]];
  }

  async init() {
    const trgAddress = await getTrgAddress(
      this.wallet,
      this.connection,
      this.ADDRESSES.DEX_ID,
      this.ADDRESSES.MPG_ID
    );
    if (!trgAddress)
      throw new Error(
        "Create a Trader Account first by using,createTraderAccount()"
      );
    const res = await TraderRiskGroup.fetch(this.connection, trgAddress);
    this.trgKey = trgAddress;
    this.traderRiskGroup = res![0];
    const userTokenAccount = await getUserAta(
      this.wallet.publicKey,
      this.ADDRESSES.VAULT_MINT
    );
    this.userTokenAccount = userTokenAccount;
    const vault = getMpgVault(
      this.ADDRESSES.VAULT_SEED,
      this.ADDRESSES.MPG_ID,
      this.ADDRESSES.DEX_ID
    );
    this.marketProductGroupVault = vault;
  }

  async depositFundsIx(amount: Fractional) {
    if (
      !this.marketProductGroupVault ||
      !this.traderRiskGroup ||
      !this.userTokenAccount
    )
      throw new Error(
        "Please run init() function first to initialise the trader state!"
      );
    const accounts = {
        tokenProgram: TOKEN_PROGRAM_ID,
        user: this.wallet.publicKey,
        userTokenAccount: this.userTokenAccount,
        traderRiskGroup: this.trgKey,
        marketProductGroup: this.traderRiskGroup.marketProductGroup,
        marketProductGroupVault: this.marketProductGroupVault,
      },
      params = {
        quantity: amount,
      };
    return await this.program.methods
      .depositFunds(params)
      .accounts(accounts)
      .signers([])
      .instruction();
  }

  async withdrawFundsIx(amount: Fractional) {
    if (
      !this.marketProductGroupVault ||
      !this.traderRiskGroup ||
      !this.userTokenAccount
    )
      throw new Error(
        "Please run init() function first to initialise the trader state!"
      );
    const accounts = {
        tokenProgram: TOKEN_PROGRAM_ID,
        user: this.wallet.publicKey,
        userTokenAccount: this.userTokenAccount,
        traderRiskGroup: this.trgKey,
        marketProductGroup: this.traderRiskGroup.marketProductGroup,
        marketProductGroupVault: this.marketProductGroupVault,
        riskEngineProgram: this.ADDRESSES.RISK_ID,
        riskModelConfigurationAcct:
          this.marketProductGroup.riskModelConfigurationAcct,
        riskOutputRegister: this.marketProductGroup.riskOutputRegister,
        traderRiskStateAcct: this.traderRiskGroup.riskStateAccount,
        riskSigner: getRiskSigner(this.ADDRESSES.MPG_ID, this.ADDRESSES.DEX_ID),
      },
      params = {
        quantity: amount,
      };
    return await this.program.methods
      .withdrawFunds(params)
      .accounts(accounts)
      .signers([])
      .instruction();
  }

  async newOrderIx(
    qty: Fractional,
    price: Fractional,
    side: TradeSide,
    orderType: OrderType,
    product: Product,
    matchLimit?: number,
  ) {
    const orderParam = {
      maxBaseQty: qty,
      side: getTradeSideEnum(side),
      selfTradeBehavior: {
        decrementTake: {},
      },
      matchLimit: new BN(matchLimit ? matchLimit : 10),
      orderType: getOrderTypeEnum(orderType),
      limitPrice: price,
    };

    const orderAccounts = {
      user: this.wallet.publicKey,
      traderRiskGroup: this.trgKey,
      marketProductGroup: this.traderRiskGroup?.marketProductGroup,
      product: product.PRODUCT_ID,
      aaobProgram: this.ADDRESSES.ORDERBOOK_P_ID,
      orderbook: product.ORDERBOOK_ID,
      marketSigner: product.marketSigner,
      eventQueue: product.EVENT_QUEUE,
      bids: product.BIDS,
      asks: product.ASKS,
      systemProgram: SystemProgram.programId,
      feeModelProgram: this.ADDRESSES.FEES_ID,
      feeModelConfigurationAcct:
        this.marketProductGroup.feeModelConfigurationAcct,
      traderFeeStateAcct: this.traderRiskGroup?.feeStateAccount,
      feeOutputRegister: this.marketProductGroup.feeOutputRegister,
      riskEngineProgram: this.ADDRESSES.RISK_ID,
      riskModelConfigurationAcct:
        this.marketProductGroup.riskModelConfigurationAcct,
      riskOutputRegister: this.marketProductGroup.riskOutputRegister,
      traderRiskStateAcct: this.traderRiskGroup?.riskStateAccount,
      riskAndFeeSigner: getRiskAndFeeSigner(
        this.ADDRESSES.MPG_ID,
        this.ADDRESSES.DEX_ID
      ),
    };

    return await this.program.methods
      .newOrder(orderParam)
      .accounts(orderAccounts)
      .signers([])
      .instruction();
  }

  async cancelOrderIx(orderId: string, product: Product) {
    const orderParam = {
      orderId: new BN(orderId),
    };

    const orderAccounts = {
      user: this.wallet.publicKey,
      traderRiskGroup: this.trgKey,
      marketProductGroup: this.traderRiskGroup?.marketProductGroup,
      product: product.PRODUCT_ID,
      aaobProgram: this.ADDRESSES.ORDERBOOK_P_ID,
      orderbook: product.ORDERBOOK_ID,
      marketSigner: product.marketSigner,
      eventQueue: product.EVENT_QUEUE,
      bids: product.BIDS,
      asks: product.ASKS,
      systemProgram: SystemProgram.programId,
      riskEngineProgram: this.ADDRESSES.RISK_ID,
      riskModelConfigurationAcct:
        this.marketProductGroup.riskModelConfigurationAcct,
      riskOutputRegister: this.marketProductGroup.riskOutputRegister,
      traderRiskStateAcct: this.traderRiskGroup?.riskStateAccount,
      riskSigner: getRiskAndFeeSigner(
        this.ADDRESSES.MPG_ID,
        this.ADDRESSES.DEX_ID
      ),
    };

    return await this.program.methods
      .cancelOrder(orderParam)
      .accounts(orderAccounts)
      .signers([])
      .instruction();
  }
}
