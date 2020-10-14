import { Injectable } from '@angular/core';
import { BigNumber } from 'bignumber.js';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { scan, filter, take, map } from "rxjs/operators";

import TRC20ABI from '../constants/abis/TRC20.json';
import SwapABI from '../constants/abis/Swap.json';
import { ContractAddress } from '../constants/contracts';
import { Token } from '../constants/tokens';
import { TokenInfo } from '../types/TokenInfo';

export interface TronState {
  tronWeb: TronWebInstance | null;
  account: string;
  balance: number;
  tokens: {
    [address: string]: TokenInfo,
  };
}

function getDefaultState(): TronState {
  return {
    tronWeb: null,
    account: '',
    balance: 0,
    tokens: {
      [Token.USDT]: {
        address: Token.USDT,
        name: 'USDT',
        decimals: 6,
        balance: new BigNumber(0),
        allowance: new BigNumber(0),
      },
      [Token.USDJ]: {
        address: Token.USDJ,
        name: 'USDJ',
        decimals: 18,
        balance: new BigNumber(0),
        allowance: new BigNumber(0),
      },
      [Token.swUSD]: {
        address: Token.swUSD,
        name: 'Swerve-Tron USDT/USDJ',
        decimals: 18,
        balance: new BigNumber(0),
        allowance: new BigNumber(0),
      },
    }
  };
}

@Injectable({
  providedIn: 'root'
})
export class StateService {

  private state$ = new BehaviorSubject<TronState>(getDefaultState());
  private update$ = new Subject<(state: TronState) => void>();

  constructor() {
    this.update$.pipe(
      scan((state: TronState, func: (state: TronState) => void) => {
        func(state);

        return state;
      }, getDefaultState())
    ).subscribe(this.state$);
  }

  initialize() {
    let interval = setInterval(() => {
      const ready = window.tronWeb?.ready ?? false;
      if (!ready)
        return;

      this.update$.next(state => {
        state.tronWeb = window.tronWeb;
        state.account = window.tronWeb.defaultAddress.base58;

        return state;
      });

      this.requestAccountBalance();

      clearInterval(interval);
    }, 1000);
  }

  getInitialized$() {
    return this.state$.pipe(
      filter(state => !!state.tronWeb),
      take(1)
    );
  }

  getState$() {
    return this.state$.pipe(
      filter(state => !!state.tronWeb)
    );
  }

  requestAccountBalance() {
    if (!window.tronWeb)
      throw new Error("TronWeb not initialized");

    window.tronWeb.trx.getBalance().then(balance => {
      this.update$.next(state => {
        state.balance = balance;
      });
    });
  }

  requestTRC20TokenBalance(token: Token) {
    if (!window.tronWeb)
      throw new Error("TronWeb not initialized");

    const contract = window.tronWeb.contract(TRC20ABI, token);

    contract.methods.balanceOf(window.tronWeb.defaultAddress.base58).call().then(result => {
      const balance = this.convertBadBigNumber(result);

      this.update$.next(state => {
        state.tokens[token].balance = balance;
      });
    });
  }
  requestTRC20TokenAllowance(token: Token) {
    if (!window.tronWeb)
      throw new Error("TronWeb not initialized");

    const contract = window.tronWeb.contract(TRC20ABI, token);

    contract.methods.allowance(window.tronWeb.defaultAddress.base58, ContractAddress.Swap).call().then(result => {
      const allowance = this.convertBadBigNumber(result);

      this.update$.next(state => {
        state.tokens[token].allowance = allowance;
      });
    });
  }

  getToken$(token: Token): Observable<TokenInfo> {
    return this.state$.pipe(
      filter(state => !!state.tronWeb),
      map(state => state.tokens[token])
    )
  }

  async approve(token: Token, amount: BigNumber) {
    if (!window.tronWeb)
      throw new Error("TronWeb not initialized");

    await window.tronWeb.contract(TRC20ABI, token).methods.approve(ContractAddress.Swap, amount.toString()).send({ shouldPollResponse: true });

    this.requestTRC20TokenAllowance(token);
    this.requestAccountBalance();
  }

  async addLiquidity(usdt: BigNumber, usdj: BigNumber) {
    const swapContract = window.tronWeb.contract(SwapABI, ContractAddress.Swap);
    const swapTokenContract = window.tronWeb.contract(TRC20ABI, ContractAddress.SwapToken);

    const amounts = [usdt.toString(), usdj.toString()];

    let minAmount = new BigNumber(0);
    const totalSupply = this.convertBadBigNumber(await swapTokenContract.methods.totalSupply().call());
    if (totalSupply.gt(0)) {
    }

    await swapContract.methods.add_liquidity(amounts, minAmount.toString()).send({ shouldPollResponse: true });

    this.requestAccountBalance();
  }
  async removeLiquidity(amount: BigNumber) {
    const swapContract = window.tronWeb.contract(SwapABI, ContractAddress.Swap);
    const swapTokenContract = window.tronWeb.contract(TRC20ABI, ContractAddress.SwapToken);

    const amounts = ["0", "0"];

    await swapContract.methods.remove_liquidity(amount.toString(), amounts).send({ shouldPollResponse: true });

    this.requestAccountBalance();
  }

  private convertBadBigNumber(value: any) {
    if (value._ethersType === 'BigNumber')
      value = new BigNumber(value.toHexString());

    return value;
  }
}

