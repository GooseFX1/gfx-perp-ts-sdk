import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";
import { Connection, PublicKey } from "@solana/web3.js";
import { ADDRESSES } from "./constants";

export const getTrgAddress = async (
  wallet: NodeWallet,
  connection: Connection
): Promise<PublicKey | null> => {
  const response = await connection.getParsedProgramAccounts(
    ADDRESSES.MAINNET.DEX_ID,
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
            bytes: ADDRESSES.MAINNET.MPG_ID.toBase58(),
          },
        },
      ],
      commitment: "processed",
    }
  );
  if (response.length >= 1) return response[0]?.pubkey;
  else return null;
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
