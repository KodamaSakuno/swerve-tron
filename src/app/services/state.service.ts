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
        balance: '0',
        allowance: '0',
      },
      [Token.USDJ]: {
        address: Token.USDJ,
        name: 'USDJ',
        decimals: 18,
        balance: '0',
        allowance: '0',
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
      const balance = result;

      this.update$.next(state => {
        state.tokens[token].balance = balance;
      });
    });
  }

  getToken$(token: Token): Observable<TokenInfo> {
    return this.state$.pipe(
      filter(state => !!state.tronWeb),
      map(state => state.tokens[token])
    )
  }
}

