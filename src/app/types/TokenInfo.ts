import { Token } from '../constants/tokens';

export type TokenInfo = {
  address: Token,
  name: string,
  decimals: number,
  balance: string,
  allowance: string,
}
