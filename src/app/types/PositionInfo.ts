import { BigNumber } from 'bignumber.js';

import { TokenInfo } from './TokenInfo';

type PooledTokenInfo = {
  decimals: number,
  balance: BigNumber,
}

export type PositionInfo = {
  lpToken: TokenInfo,
  pooledTokens: {
    usdt: PooledTokenInfo,
    usdj: PooledTokenInfo,
  },
}
