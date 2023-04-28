  # gfx-perp-sdk

  This SDK contains 3 classes to interact with the GooseFX on-chain perpetual futures. 
  * ``Perp``
  * ``Product``
  * ``Trader``

  The `Perp` class is required to initialise the connection and wallet that is going to be used for subsequent interaction. 
  Initialising the `Perp` class should be the first step irrespective of the type of operation in the following manner: 

  ```javascript
  const perp = new Perp(connection, 'mainnet', wallet);
  await perp.init();
  ```


### Product

  An instance of the `product` class signfies one of the perp product we offer to trade. Initialization of the `product` class can be done in one of two ways: 

  1. By index: 

  ```javascript
  const perp = new Perp(connection, 'mainnet', wallet);
  await perp.init();
  const product = new Product(perp);
  product.initByIndex(0);
  ```

  2. By name:

  ```javascript
  const perp = new Perp(connection, 'mainnet', wallet);
  await perp.init();
  const product = new Product(perp);
  product.initByName('SOL-PERP');
  ```

  This `product` instance will be useful for the following functions: 

  * `GET L2 Orderbook`: Get the latest layer 2 orderbook
  ```javascript
  const orderbook = await product.getOrderbookL2();
  ```

  * `GET L3 Orderbook`: Get the latest layer 3 orderbook. (Orders mapped to users)
  ```javascript
  const orderbook = await product.getOrderbookL3();
  ```
  * `Subscribe to Orderbook`: Subscribe to the orderbook account and listen to changes. In the example below, `handleAccountChange` is the callback function which will be called on each state change of the orderbook. Pass your function as the parameter to the ```subscribeToOrderbook ```function to handle orderbook changes and do not forget to unsubscribe when not needed anymore!

  ```javascript
    async function handleAccountChange(){
      const res = await product.getOrderbookL2();
      console.log("Updated orderbook: ", res);
    }
    const subscribeId = product.subscribeToOrderbook(handleAccountChange);
    connection.removeAccountChangeListener(subscribeId); //To close the subscription
  ```
### Trader

  The `Trader` class is required to get instructions to send transactions to the program. Each wallet must have a unique trader account initialized to be able to place orders and deposit funds. This account needs to be created once using the ```createTraderAccountIxs``` instruction. After it has been created once, for all subsequent interactions by the wallet, the `Trader` class needs to be initialized using the ```init``` function. 
  * To create a new `Trader` account on-chain: 
  ```javascript
    const perp = new Perp(connection, 'mainnet', wallet);
    await perp.init();
    const trader = new Trader(perp);
    const [ixs, signers] = await trader.createTraderAccountIxs();
  ```
  where ```ixs``` is an array of required instructions and ```signers``` is an array of required keypairs for signature. The wallet must also sign the transaction along with the keypairs in the ```signers``` array

  * Once the account is created successfully, the `Trader` instance must be initialised in the following way: 
  ```javascript
    const perp = new Perp(connection, 'mainnet', wallet);
    await perp.init();
    const trader = new Trader(perp);
    await trader.init();
  ```



## Trader Instructions

### Deposit Funds

To start placing new orders, traders need to deposit some collateral. This instruction will transfer the required USDC from the wallet to the trader account which will be used as collateral to place new orders.

The only parameter to this function is the amount of USDC to be depositted.

```javascript
  const perp = new Perp(connection, 'mainnet', wallet);
  await perp.init();
  const trader = new Trader(perp);
  await trader.init();
  const ix = await trader.depositFundsIx(new Fractional({
    m: new BN(1),
    exp: new BN(0)
  }));
```

### Withdraw Funds

Similar to deposit funds, this function takes the amount of USDC to be withdrawn as the only parameter. This instruction will transfer funds from the trader account to the wallet address.

```javascript
  const perp = new Perp(connection, 'mainnet', wallet);
  await perp.init();
  const trader = new Trader(perp);
  await trader.init();
  const ix = await trader.withdrawFundsIx(new Fractional({
    m: new BN(1),
    exp: new BN(0)
  }));
```

NOTE: The above two instructions do not need a `product` instance as a parameter since the market is cross collateralized and the amount of USDC deposited can be used across products. The following two instructions to place a new order and cancel an order are specific to products and hence need a `product` instance as one of the parameters.

### Trader's open orders for a prouct

  To get all open orders for a `Trader` for a `product`:
  ```javascript
    const perp = new Perp(connection, 'mainnet', wallet);
    await perp.init();
    const product = new Product(perp);
    product.initByIndex(0);
    const trader = new Trader(perp);
    await trader.init();
    const orderbookData = await trader.getOpenOrders(product);
    console.log("orderbook: ", orderbookData);
  ```

### New Order

The New order instruction needs the following as parameters
  * Quantity (Fractional) 
  **Please note: 1 unit of the product is denoted by 1 * 100000 units. So to buy 1 unit, the parameter to pass as quantity should be** 
  ```javascript
    new Fractional({
      m: new BN(100000),
      exp: new BN(0)
    })
  ``` 
  * Price (Fractional)
  * Order side ('buy' or 'sell')
  * Order Type ('limit', 'market', 'immediateOrCancel', 'postOnly')
  * Product instance

```javascript
  const perp = new Perp(connection, "mainnet", wallet);
  await perp.init();
  const product = new Product(perp);
  product.initByIndex(0);
  const trader = new Trader(perp);
  await trader.init();
  const ix = await trader.newOrderIx(
    new Fractional({
      m: new BN(10000), //Implies 0.1 units
      exp: new BN(0),
    }),
    new Fractional({
      m: new BN(2245), //Price 22.45$
      exp: new BN(2),
    }),
    "buy",
    "limit",
    product
  );
```

### Cancel Order

  The cancel order instruction needs the orderId in string format to cancel the order. Use `getOpenOrders()` to get open orders and its id's to pass as a parameter to cancel the order 

  ```javascript
    const perp = new Perp(connection, "mainnet", wallet);
    await perp.init();
    const product = new Product(perp);
    product.initByIndex(0);
    const trader = new Trader(perp);
    await trader.init();
    const ix = await trader.cancelOrderIx("7922816251444880503428103912726", product);
  ```


Checkout https://github.com/GooseFX1/gfx-perp-ts-sdk/blob/main/test/index.test.js for examples on the above functionalities! Happy trading!