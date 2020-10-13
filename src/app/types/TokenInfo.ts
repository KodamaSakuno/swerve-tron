import { BigNumber } from 'bignumber.js';

import { Token } from '../constants/tokens';

export type TokenInfo = {
  address: Token,
  name: string,
  decimals: number,
  balance: BigNumber,
  allowance: BigNumber,
}
