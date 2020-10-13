declare global {
  interface TronWebInstance {
    ready?: boolean;

    defaultAddress: {
      hex: string,
      base58: string,
    };
    trx: {
      getBalance(): Promise<number>,
    };

    contract(abi: any, address: string): TronWebContract;
  }

  interface TronWebContract {
    methods: {
      [method: string]: (...args: any[]) => {
        call: () => Promise<any>,
      },
    };
  }
}

export {}
