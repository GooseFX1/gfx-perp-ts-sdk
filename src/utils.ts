import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";
import { Connection, PublicKey, SystemProgram, TransactionInstruction } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@project-serum/anchor/dist/cjs/utils/token";
import { ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { findProgramAddressSync } from "@project-serum/anchor/dist/cjs/utils/pubkey";
import { struct, u8 } from '@solana/buffer-layout'
import { TradeSide, OrderType, Trade } from "./public";
import { Fractional } from "./types";
import { EventFill } from "./public/orderbook/event_queue";
import { BN } from "bn.js";

export type TraderPosition = {
  quantity: string,
  averagePrice: string,
  index: string
}

export const getTrgAddress = async (
  wallet: NodeWallet,
  connection: Connection,
  DEX_ID: PublicKey,
  MPG_ID: PublicKey
): Promise<PublicKey | null> => {
  const response = await connection.getParsedProgramAccounts(
    DEX_ID,
    {
      filters: [
        //  {
        //    dataSize: 63632 // number of bytes
        //  },
        {
          memcmp: {
            offset: 48,
            /** data to match, a base-58 encoded string and limited to less than 129 bytes */
            bytes: wallet.publicKey.toBase58(),
          },
        },
        {
          memcmp: {
            offset: 16,
            /** data to match, a base-58 encoded string and limited to less than 129 bytes */
            bytes: MPG_ID.toBase58(),
          },
        },
      ],
      commitment: "processed",
    }
  );
  if (response.length >= 1) return response[0]?.pubkey;
  else return null;
};

export const getTrgAllAddresses = async (
  wallet: NodeWallet,
  connection: Connection,
  DEX_ID: PublicKey,
  MPG_ID: PublicKey
): Promise<PublicKey[]> => {
  const response = await connection.getParsedProgramAccounts(
    DEX_ID,
    {
      filters: [
        //  {
        //    dataSize: 63632 // number of bytes
        //  },
        {
          memcmp: {
            offset: 48,
            /** data to match, a base-58 encoded string and limited to less than 129 bytes */
            bytes: wallet.publicKey.toBase58(),
          },
        },
        {
          memcmp: {
            offset: 16,
            /** data to match, a base-58 encoded string and limited to less than 129 bytes */
            bytes: MPG_ID.toBase58(),
          },
        },
      ],
      commitment: "processed",
    }
  );
  if (response.length >= 1) {
    const keys = response.map(item => item.pubkey);
    return keys
  }
  else return [];
};

export const convertBidsAsks = (
  bids: any[],
  asks: any[],
  activeProduct: any
) => {
  const bidReturn = bids.map((item) => {
    let size = item.size;
    size = size / 10 ** (activeProduct.decimals + 5);
    let price = item.price;
    price = BigInt(price) >> BigInt(32);
    price = Number(price) / activeProduct.tick_size;
    return {
      //new anchor.BN(Number(price)), new anchor.BN(Number(size)),
      price,
      size,
    };
  });
  const askReturn = asks.map((item) => {
    let size = item.size;
    size = size / 10 ** (activeProduct.decimals + 5);
    let price = item.price;
    price = BigInt(price) >> BigInt(32);
    price = Number(price) / activeProduct.tick_size;
    return {
      //new anchor.BN(Number(price)), new anchor.BN(Number(size)),
      price,
      size,
    };
  });
  return [bidReturn.reverse(), askReturn];
};

export const convertBidsAsksOpenOrders = (
  bids: any[],
  asks: any[],
  activeProduct: any
) => {
  const bidReturn: {
    price: number;
    size: number;
    user: string;
    orderId: string;
  }[] = bids.map((item) => {
    let size = item.size;
    size = size / Number(10 ** (activeProduct.decimals + 5));
    let price = item.price;
    price = BigInt(price) >> BigInt(32);
    return {
      price: Number(price) / activeProduct.tick_size,
      size: Number(size),
      user: item.user,
      orderId: item.orderId,
    };
  });
  const askReturn: {
    price: number;
    size: number;
    user: string;
    orderId: string;
  }[] = asks.map((item) => {
    let size = item.size;
    size = size / Number(10 ** (activeProduct.decimals + 5));
    let price = item.price;
    price = BigInt(price) >> BigInt(32);
    return {
      price: Number(price) / activeProduct.tick_size,
      size: Number(size),
      user: item.user,
      orderId: item.orderId,
    };
  });
  return [
    bidReturn.filter((item) => item).reverse(),
    askReturn.filter((item) => item),
  ];
};

export const getUserAta = async (
  walletKey: PublicKey,
  vaultMint: PublicKey
): Promise<PublicKey> => {
  return (
    await PublicKey.findProgramAddress(
      [walletKey.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), vaultMint.toBuffer()],
      ASSOCIATED_TOKEN_PROGRAM_ID
    )
  )[0];
};

export const getMpgVault = (
  VAULT_SEED: string,
  MPG_ID: PublicKey,
  DEX_ID: PublicKey
): PublicKey => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(VAULT_SEED), new PublicKey(MPG_ID).toBuffer()],
    new PublicKey(DEX_ID)
  )[0];
};

export const getRiskSigner = (
  MPG_ID: PublicKey,
  DEX_ID: PublicKey
): PublicKey => {
  const address = findProgramAddressSync(
    [MPG_ID.toBuffer()],
    new PublicKey(DEX_ID)
  )[0];
  return address;
};

export const getTraderFeeAcct = (
  traderRiskGroup: PublicKey,
  MPG_ID: PublicKey,
  FEES_ID: PublicKey,
  TRADER_FEE_ACCT_SEED: string
): PublicKey => {
  const address = findProgramAddressSync(
    [
      Buffer.from(TRADER_FEE_ACCT_SEED),
      traderRiskGroup.toBuffer(),
      MPG_ID.toBuffer(),
    ],
    FEES_ID
  )[0];
  return address;
};

function createFirstInstructionData() {
  const aa = u8('instruction')
  const dataLayout = struct([aa as any])

  const data = Buffer.alloc(dataLayout.span)
  dataLayout.encode(
    {
      instruction: 1
    },
    data
  )

  return data
}

export const initializeTraderFeeAcctIx = (args: any) => {
  const keys = [
    {
      pubkey: args.payer,
      isSigner: true,
      isWritable: false
    },
    //{
    //  pubkey: args.feeModelConfigAcct,
    //  isSigner: false,
    //  isWritable: false
    //},
    {
      pubkey: args.traderFeeAcct,
      isSigner: false,
      isWritable: true
    },
    {
      pubkey: args.MPG_ID,
      isSigner: false,
      isWritable: false
    },
    {
      pubkey: args.traderRiskGroup,
      isSigner: false,
      isWritable: false
    },
    {
      pubkey: SystemProgram.programId,
      isSigner: false,
      isWritable: false
    }
  ]
  return new TransactionInstruction({
    keys,
    programId: args.FEES_ID,
    data: createFirstInstructionData()
  })
}

export const getFeeModelConfigAcct = (
  MPG_ID: PublicKey,
  FEES_ID: PublicKey,
  FEES_SEED: string
): PublicKey => {
  const address = findProgramAddressSync(
    [Buffer.from(FEES_SEED), MPG_ID.toBuffer()],
    FEES_ID
  )[0];
  return address;
};

export const getTradeSideEnum = (tradeSide: TradeSide) => {
  if (tradeSide === 'buy')
    return {bid: {}}
  else if (tradeSide === 'sell')
    return {ask: {}}
}

export const getOrderTypeEnum = (orderType: OrderType) => {
  if (orderType === "limit") return { limit: {} };
  else if (orderType === "market") return { market: {} };
  else if (orderType === "immediateOrCancel") return { ioc: {} };
  else if (orderType === "postOnly") return { postOnly: {} };
};

export const getMarketSigner = (product: PublicKey, DEX_ID: PublicKey): PublicKey => {
  const address = PublicKey.findProgramAddressSync(
    [product.toBuffer()],
    DEX_ID
  )
  return address[0]
}

export const getRiskAndFeeSigner = (
  marketProductGroup: PublicKey,
  DEX_ID: PublicKey
): PublicKey =>
  PublicKey.findProgramAddressSync([marketProductGroup.toBuffer()], DEX_ID)[0];

export const displayFractional = (val: Fractional): string => {
  const base = val.m.toString();
  if (Number(base) === 0) return "0.00";
  const decimals = Number(val.exp.toString());
  if (decimals === 0) return base;
  else if (base[0] === "-" && base.length - 1 === decimals)
    return "-0." + base.slice(1, base.length);
  else if (base[0] === "-" && base.length - 1 < decimals)
    return (
      "-0." +
      "0".repeat(decimals - base.length + 1) +
      base.slice(1, base.length)
    );
  else if (base.length === decimals) return "0." + base;
  else if (base.length < decimals)
    return "0." + "0".repeat(decimals - base.length) + base;
  return base.slice(0, -decimals) + "." + base.slice(-decimals);
};

const checkSingleEvent = (a: EventFill, b: EventFill): boolean => {
  if (
    a.baseSize.eq(b.baseSize) &&
    a.makerOrderId.eq(b.makerOrderId) &&
    a.takerSide === b.takerSide &&
    a.quoteSize.eq(b.quoteSize) &&
    a.makerCallbackInfo.toString() === b.makerCallbackInfo.toString() &&
    a.takerCallbackInfo.toString() === b.takerCallbackInfo.toString()
  )
    return true;
  return false;
};

export const getDiffEvents = (prevEvents: EventFill[], currentEvents: EventFill[]): EventFill[] => {
  const newEvents: EventFill[] = [] 
  for (let i=0; i<currentEvents.length; i++){
    let found = false
    for (let j=0; j<prevEvents.length; j++){
      const isSame = checkSingleEvent(currentEvents[i], prevEvents[j])
      if (isSame){
        found = true
        break
      }
    }
    if (!found){
      newEvents.push(currentEvents[i])
    }
  }
  return newEvents;
}

const getOrderId = (a: number[]): number => {
  let num = 0
  for (let i=0; i<a.length; i++){
    const base = Math.pow(256, i)
    num = num + (a[i] * base)
  }
  return num
}

export const filterEvent = (res: EventFill, tickSize: number): Trade => {
  const maker = new PublicKey(res.makerCallbackInfo.slice(0, 32));
  const taker = new PublicKey(res.takerCallbackInfo.slice(0, 32));
  const makerCallbackId = getOrderId(res.makerCallbackInfo.slice(36, 40));
  const takerCallbackId = getOrderId(res.takerCallbackInfo.slice(36, 40));

  const execId = Math.floor(Math.random() * 90000) + 10000;
  const dbTrade: Trade = {
    side: res.takerSide,
    orderId: res.makerOrderId.toString(),
    takerCallbackId: takerCallbackId,
    taker: taker.toBase58(),
    makerCallbackId: makerCallbackId,
    maker: maker.toBase58(),
    price: res.quoteSize.mul(new BN('100')).div(res.baseSize).div(new BN('100')).toNumber() / tickSize,
    qty: res.baseSize.toNumber() / 1000000000000,
    time: Math.floor((+new Date())/1000),
    tradeId: execId
  }
  // dbTrade["price"] = res.quoteSize.toNumber() / (res.baseSize.toNumber() * 100)
  return dbTrade
}