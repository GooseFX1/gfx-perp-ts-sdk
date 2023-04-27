import { Keypair, PublicKey, SystemProgram, TransactionInstruction } from "@solana/web3.js";
import { TraderRiskGroup } from "../layout";
import { Fractional } from "../types";
import {
  getFeeModelConfigAcct,
  getMpgVault,
  getRiskSigner,
  getTraderFeeAcct,
  getTrgAddress,
  getUserAta,
  initializeTraderFeeAcctIx,
} from "../utils";
import { Perp } from "./base";
import { ADDRESSES } from "../constants";
import {
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";

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

  async createTraderAccountIxs(): Promise<[TransactionInstruction[], Keypair[]]> {
    const trgAddress = await getTrgAddress(this.wallet, this.connection);
    if (trgAddress) throw new Error("Trader already exists with this wallet!");
    const ixs = [];

    const initTrgAddress = Keypair.generate();
    const riskStateAccount = Keypair.generate();

    const traderFeeAcct = getTraderFeeAcct(
      initTrgAddress.publicKey,
      ADDRESSES.MAINNET.MPG_ID,
      ADDRESSES.MAINNET.FEES_ID,
      ADDRESSES.MAINNET.TRADER_FEE_ACCT_SEED
    );
    const userTokenAccount = await getUserAta(
      this.wallet.publicKey,
      ADDRESSES.MAINNET.VAULT_MINT
    );

    const res = await this.connection.getAccountInfo(userTokenAccount);
    if (!res) {
      ixs.push(
        createAssociatedTokenAccountInstruction(
          this.wallet.publicKey, // payer
          userTokenAccount, // ata
          this.wallet.publicKey, // owner
          ADDRESSES.MAINNET.VAULT_MINT // mint
        )
      );
    }
    ixs.push(
      initializeTraderFeeAcctIx({
        payer: this.wallet.publicKey,
        traderFeeAcct: traderFeeAcct,
        traderRiskGroup: initTrgAddress.publicKey,
        feeModelConfigAcct: getFeeModelConfigAcct(
          ADDRESSES.MAINNET.MPG_ID,
          ADDRESSES.MAINNET.FEES_ID,
          ADDRESSES.MAINNET.FEES_SEED
        ),
        MPG_ID: ADDRESSES.MAINNET.MPG_ID,
        FEES_ID: ADDRESSES.MAINNET.FEES_ID,
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
        programId: ADDRESSES.MAINNET.DEX_ID,
      })
    );
    ixs.push(
      await this.program.methods
        .initializeTraderRiskGroup()
        .accounts({
          owner: this.wallet.publicKey,
          traderRiskGroup: initTrgAddress.publicKey,
          marketProductGroup: ADDRESSES.MAINNET.MPG_ID,
          riskSigner: getRiskSigner(
            ADDRESSES.MAINNET.MPG_ID,
            ADDRESSES.MAINNET.DEX_ID
          ),
          traderRiskStateAcct: riskStateAccount.publicKey,
          traderFeeStateAcct: traderFeeAcct,
          riskEngineProgram: ADDRESSES.MAINNET.RISK_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([])
        .instruction()
    );
    return [ixs, [initTrgAddress, riskStateAccount]]
  }

  async init() {
    const trgAddress = await getTrgAddress(this.wallet, this.connection);
    if (!trgAddress)
      throw new Error(
        "Create a Trader Account first by using,createTraderAccount()"
      );
    const res = await TraderRiskGroup.fetch(this.connection, trgAddress);
    this.trgKey = trgAddress;
    this.traderRiskGroup = res![0];
    const userTokenAccount = await getUserAta(
      this.wallet.publicKey,
      ADDRESSES.MAINNET.VAULT_MINT
    );
    this.userTokenAccount = userTokenAccount;
    const vault = getMpgVault(
      ADDRESSES.MAINNET.VAULT_SEED,
      ADDRESSES.MAINNET.MPG_ID,
      ADDRESSES.MAINNET.DEX_ID
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
        riskEngineProgram: ADDRESSES.MAINNET.RISK_ID,
        riskModelConfigurationAcct:
          this.marketProductGroup.riskModelConfigurationAcct,
        riskOutputRegister: this.marketProductGroup.riskOutputRegister,
        traderRiskStateAcct: this.traderRiskGroup.riskStateAccount,
        riskSigner: getRiskSigner(
          ADDRESSES.MAINNET.MPG_ID,
          ADDRESSES.MAINNET.DEX_ID
        ),
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
}
