import { PublicKey } from "@solana/web3.js";
import { Perp } from "./base";
import { Slab } from "./orderbook/Agnostic";
import { convertBidsAsks, convertBidsAsksOpenOrders, getMarketSigner } from "../utils";
import axios from "axios";
import { API_BASE, TRADE_HISTORY } from "../constants";

export class Product extends Perp {
  name: string;
  PRODUCT_ID: PublicKey;
  ORDERBOOK_ID: PublicKey;
  BIDS: PublicKey;
  ASKS: PublicKey;
  EVENT_QUEUE: PublicKey;
  marketSigner: PublicKey;
  tick_size: number;
  decimals: number;

  constructor(perp: Perp) {
    super(
      perp.connection,
      perp.networkType,
      perp.wallet,
      perp.marketProductGroup
    );
  }

  initByIndex(index: number) {
    let products = null;
    products = this.ADDRESSES;
    if (index > products.PRODUCTS.length - 1)
      throw new Error("Index out of bounds");
    const selectedProduct = products.PRODUCTS[index];
    this.name = selectedProduct.name;
    this.PRODUCT_ID = selectedProduct.PRODUCT_ID;
    this.ORDERBOOK_ID = selectedProduct.ORDERBOOK_ID;
    this.BIDS = selectedProduct.BIDS;
    this.ASKS = selectedProduct.ASKS;
    this.EVENT_QUEUE = selectedProduct.EVENT_QUEUE;
    this.tick_size = selectedProduct.tick_size;
    this.decimals = selectedProduct.decimals;
    this.marketSigner = getMarketSigner(
      selectedProduct.PRODUCT_ID,
      this.ADDRESSES.DEX_ID
    );
  }

  initByName(name: string) {
    let products = null;
    products = this.ADDRESSES;
    products = products.PRODUCTS.filter((product) => product.name === name);
    if (!products.length) throw new Error("No Such product");
    const selectedProduct = products[0];
    this.name = selectedProduct.name;
    this.PRODUCT_ID = selectedProduct.PRODUCT_ID;
    this.ORDERBOOK_ID = selectedProduct.ORDERBOOK_ID;
    this.BIDS = selectedProduct.BIDS;
    this.ASKS = selectedProduct.ASKS;
    this.EVENT_QUEUE = selectedProduct.EVENT_QUEUE;
    this.tick_size = selectedProduct.tick_size;
    this.decimals = selectedProduct.decimals;
  }

  async getOrderbookL2() {
    if (!this.PRODUCT_ID)
      throw new Error(
        "Product not initialized. Please initialize with initByIndex() or initByName() "
      );
    const bidsInfo = await this.connection.getAccountInfo(
      this.BIDS,
      "processed"
    );
    const asksInfo = await this.connection.getAccountInfo(
      this.ASKS,
      "processed"
    );
    if (!bidsInfo || !asksInfo) throw new Error("Invalid Bids and Asks");
    const bidDeserialized = Slab.deserialize(bidsInfo?.data, 40);
    const askDeserialized = Slab.deserialize(asksInfo?.data, 40);

    const bidsOrderbook = bidDeserialized.getL2DepthJS(40, true);
    const asksOrderbook = askDeserialized.getL2DepthJS(40, true);

    const finalData = convertBidsAsks(bidsOrderbook, asksOrderbook, {
      tick_size: this.tick_size,
      decimals: this.decimals,
    });
    return {
      bids: finalData[0],
      asks: finalData[1],
    };
  }

  async getOrderbookL3() {
    if (!this.PRODUCT_ID)
      throw new Error(
        "Product not initialized. Please initialize with initByIndex() or initByName() "
      );
    const bidsInfo = await this.connection.getAccountInfo(
      this.BIDS,
      "processed"
    );
    const asksInfo = await this.connection.getAccountInfo(
      this.ASKS,
      "processed"
    );
    if (!bidsInfo || !asksInfo) throw new Error("Invalid Bids and Asks");
    const bidDeserialized = Slab.deserialize(bidsInfo?.data, 40);
    const askDeserialized = Slab.deserialize(asksInfo?.data, 40);

    const bids = [];
    const asks = [];
    for (const bid of bidDeserialized.items(false)) {
      const callbackBuffer = bid.callbackInfo;
      bids.push({
        price: BigInt(bid.leafNode.getPrice().toString()),
        size: Number(bid.leafNode.baseQuantity.toString()),
        user: new PublicKey(callbackBuffer.slice(0, 32)).toBase58(),
        orderId: bid.leafNode.key.toString(),
      });
    }
    for (const ask of askDeserialized.items(false)) {
      const callbackBuffer = ask.callbackInfo;
      asks.push({
        price: BigInt(ask.leafNode.getPrice().toString()),
        size: Number(ask.leafNode.baseQuantity.toString()),
        user: new PublicKey(callbackBuffer.slice(0, 32)).toBase58(),
        orderId: ask.leafNode.key.toString(),
      });
    }
    const finalData = convertBidsAsksOpenOrders(bids, asks, {
      tick_size: this.tick_size,
      decimals: this.decimals,
    });
    return {
      bids: finalData[0],
      asks: finalData[1],
    };
  }

  async getTrades() {
    const headers = {
      "Content-Type": "application/json",
    };
    const data = {
      pairName: this.name,
      devnet: this.networkType === "devnet" ? true : false,
    };
    const response = await axios.post(API_BASE + TRADE_HISTORY, data, {
      headers,
    });
    return response;
  }

  subscribeToOrderbook(subscribeFn: any) {
    const id = this.connection.onAccountChange(this.EVENT_QUEUE, subscribeFn);
    return id;
  }
}
