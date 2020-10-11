declare global {
  interface TronWebInstance {
    BigNumber: BigNumberConstructor;

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

  interface BigNumberConstructor {
    new(value: number): BigNumber;
  }
  class BigNumber {
    constructor(value: number);

    toString(): string;
  }
}

export {}
