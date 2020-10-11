declare global {
  interface TronWebInstance {
    defaultAddress: {
      hex: string,
      base58: string,
    };
    trx: {
      getBalance(): Promise<number>,
    };
  }
}

export {}
