declare global {
  interface TronWebInstance {
    ready?: boolean;

    defaultAddress: {
      hex: string,
      base58: string,
    };
    fullNode: {
      host: string,
    };
    trx: {
      getUnconfirmedBalance(): Promise<number>,
      getTransaction(transactionId: string): Promise<any>,
    };

    contract(abi: any, address: string): TronWebContract;
  }

  interface TronWebContract {
    methods: {
      [method: string]: (...args: any[]) => {
        call(): Promise<any>,
        send(options?: Object): Promise<any>,
      },
    };
  }
}

export {}
