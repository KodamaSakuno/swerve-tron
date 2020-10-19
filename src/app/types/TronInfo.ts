import { BigNumber } from 'bignumber.js';

export type TronInfo = {
  tronWeb: TronWebInstance,
  node: string,
  account: string,
  balance: BigNumber,
}
