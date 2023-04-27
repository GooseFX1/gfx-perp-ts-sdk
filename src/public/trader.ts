import { TraderRiskGroup } from "../layout";
import { Fractional } from "../types";
import { getTrgAddress } from "../utils";
import { Perp } from "./base";

export class Trader extends Perp {
  traderRiskGroup: TraderRiskGroup | null;

  constructor(perp: Perp) {
    super(
      perp.connection,
      perp.networkType,
      perp.wallet,
      perp.marketProductGroup
    );
  }

  async createTraderAccount() {
    const trgAddress = await getTrgAddress(this.wallet, this.connection);
    if (trgAddress) throw new Error("Trader already exists with this wallet!");
  }

  async init() {
    const trgAddress = await getTrgAddress(this.wallet, this.connection);
    if (!trgAddress)
      throw new Error("Create a Trader Account first by using,createTraderAccount()")
    const res = await TraderRiskGroup.fetch(this.connection, trgAddress)
    this.traderRiskGroup = res![0]
  }

  async deposit(amount: Fractional){
    
  }
}
