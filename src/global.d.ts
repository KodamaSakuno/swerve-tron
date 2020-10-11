declare global {
  interface TronWebInstance {
    defaultAddress: {
      hex: string,
      base58: string,
    };
  }
}

export {}
