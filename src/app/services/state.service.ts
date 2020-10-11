import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { scan, filter, take, map } from "rxjs/operators";

import TRC20ABI from '../constants/abis/TRC20.json';
import { Token } from '../constants/tokens';
import { TokenInfo } from '../types/TokenInfo';

export interface TronState {
  tronWeb: TronWebInstance | null;
  account: string;
  balance: number;
  tokenDecimals: { [address: string]: number };
  tokenBalances: { [address: string]: BigNumber };
}

function getDefaultState(): TronState {
  return {
    tronWeb: null,
    account: '',
    balance: 0,
    tokenDecimals: {},
    tokenBalances: {},
  };
}

@Injectable({
  providedIn: 'root'
})
export class StateService {

  private state$ = new BehaviorSubject<TronState>(getDefaultState());
  private update$ = new Subject<(state: TronState) => TronState>();

  constructor() {
    this.update$.pipe(
      scan((state: TronState, func: Function) => func(state), getDefaultState())
    ).subscribe(this.state$);
  }

  initialize() {
    let interval = setInterval(() => {
      if (!window.tronWeb)
        return;

      this.update$.next(state => {
        state.tronWeb = window.tronWeb;
        state.account = window.tronWeb.defaultAddress.base58;

        return state;
      });

      this.requestAccountBalance();
      this.requestTRC20TokenDecimals(Token.USDT);
      this.requestTRC20TokenDecimals(Token.USDJ);

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

        return state;
      });
    });
  }

  requestTRC20TokenDecimals(token: Token) {
    if (!window.tronWeb)
      throw new Error("TronWeb not initialized");

    const contract = window.tronWeb.contract(TRC20ABI, token);

    contract.methods.decimals().call().then(result => {
      this.update$.next(state => {
        state.tokenDecimals[token] = result;

        return state;
      });
    });
  }
  requestTRC20TokenBalance(token: Token) {
    if (!window.tronWeb)
      throw new Error("TronWeb not initialized");

    const contract = window.tronWeb.contract(TRC20ABI, token);

    contract.methods.balanceOf(window.tronWeb.defaultAddress.base58).call().then(result => {
      this.update$.next(state => {
        state.tokenBalances[token] = result;

        return state;
      });
    });
  }

  getToken$(token: Token): Observable<TokenInfo> {
    return this.state$.pipe(
      filter(state => !!state.tronWeb && !!state.tokenDecimals[token] && !!state.tokenBalances[token]),
      map(state => ({
        decimals: state.tokenDecimals[token],
        balance: state.tokenBalances[token],
      }))
    )
  }
}

