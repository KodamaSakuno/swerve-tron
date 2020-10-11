import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { scan, filter } from "rxjs/operators";

export interface TronState {
  tronWeb: TronWebInstance | null;
  account: string;
  balance: number;
}

function getDefaultState(): TronState {
  return {
    tronWeb: null,
    account: '',
    balance: 0,
  };
}

@Injectable({
  providedIn: 'root'
})
export class TronService {

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

      clearInterval(interval);
    }, 1000);
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
}

