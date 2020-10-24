import { Injectable } from '@angular/core';
import { BigNumber } from 'bignumber.js';
import { BehaviorSubject, Observable, Subject, defer, fromEvent, merge, combineLatest, from } from 'rxjs';
import { scan, filter, take, map, distinctUntilChanged, mergeMap, withLatestFrom, delay, tap, distinctUntilKeyChanged } from "rxjs/operators";

import TRC20ABI from '../constants/abis/TRC20.json';
import SwapABI from '../constants/abis/Swap.json';
import { ContractAddress } from '../constants/contracts';
import { Token } from '../constants/tokens';
import { TokenInfo } from '../types/TokenInfo';
import { PositionInfo } from '../types/PositionInfo';
import { TronInfo } from '../types/TronInfo';

export interface State {
  balance: BigNumber;
  tokens: {
    [address: string]: TokenInfo,
  };
  pool: {
    totalSupply: BigNumber,
    usdtBalance: BigNumber,
    usdjBalance: BigNumber,
  };
}

function getDefaultState(): State {
  return {
    balance: new BigNumber(0),
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
    },
    pool: {
      totalSupply: new BigNumber(0),
      usdtBalance: new BigNumber(0),
      usdjBalance: new BigNumber(0),
    },
  };
}

@Injectable({
  providedIn: 'root'
})
export class StateService {
  private _tron$ = new Subject<TronInfo>();
  private _updateTron$ = new Subject<(state: TronInfo) => void>();
  readonly tron$: Observable<TronInfo>;

  private _state$ = new BehaviorSubject<State>(getDefaultState());
  private _update$ = new Subject<(state: State) => void>();
  readonly state$: Observable<State>;

  constructor() {
    this._update$.pipe(
      scan((state: State, func: (state: State) => void) => {
        func(state);

        return state;
      }, getDefaultState())
    ).subscribe(this._state$);
    this.state$ = this._state$.asObservable();

    this._updateTron$.pipe(
      scan((state, func) => {
        const newState = { ...state };
        func(newState);

        return newState;
      }, <TronInfo>{}),
    ).subscribe(this._tron$);
    this.tron$ = this._tron$.pipe(
      filter(state => !!state.tronWeb && !!state.node && !!state.account),
      distinctUntilChanged((previous, current) => previous.node === current.node && previous.account === current.account),
      delay(0),
      tap(async () => {
        await this.requestAccountBalance();
        await this.requestTRC20TokenBalance(Token.USDT);
        await this.requestTRC20TokenBalance(Token.USDJ);
        await this.requestTRC20TokenBalance(Token.swUSD);
        await this.requestPoolInfo();
      }),
    );
  }

  initialize() {
    const initialNode$ = new Subject<string>();
    const initialAccount$ = new Subject<string>();

    let interval = setInterval(() => {
      if (!window.tronWeb)
        return;
      if (!window.tronWeb.defaultAddress.base58)
        return;

      clearInterval(interval);

      this._updateTron$.next(state => {
        state.tronWeb = window.tronWeb;
        state.node = window.tronWeb.fullNode.host;
        state.account = window.tronWeb.defaultAddress.base58;
      });

      initialNode$.next(window.tronWeb.fullNode.host);
      initialNode$.complete();
      initialAccount$.next(window.tronWeb.defaultAddress.base58);
      initialAccount$.complete();
    }, 500);

    const event$ = fromEvent<MessageEvent>(window, 'message').pipe(
      filter(event => typeof event.data === 'object' && (event.data?.isTronLink ?? false)),
      map(event => [event.data.message.action, event.data.message.data]),
    );
    const nodeFromEvent$ = event$.pipe(
      filter(([type, ]) => type === 'setNode'),
      map(([, data]) => data.node.fullNode),
    );
    const accountFromEvent$ = event$.pipe(
      filter(([type, ]) => type === 'setAccount'),
      map(([, data]) => data.address),
    );

    merge(initialNode$, nodeFromEvent$).pipe(
      distinctUntilChanged(),
      map(node => (state: TronInfo) => state.node = node),
    ).subscribe(this._updateTron$);
    merge(initialAccount$, accountFromEvent$).pipe(
      distinctUntilChanged(),
      map(account => (state: TronInfo) => state.account = account),
    ).subscribe(this._updateTron$);
  }

  async requestAccountBalance() {
    const balance = new BigNumber(await window.tronWeb.trx.getUnconfirmedBalance());

    this._update$.next(state => state.balance = balance);
  }
  async requestTRC20TokenBalance(token: Token) {
    const contract = window.tronWeb.contract(TRC20ABI, token);
    const address = window.tronWeb.defaultAddress.base58;

    try {
      const balance = this.convertBadBigNumber(await contract.methods.balanceOf(address).call());

      this._update$.next(state => state.tokens[token].balance = balance);
    } catch (e) {
      this._update$.next(state => state.tokens[token].balance = new BigNumber(0));
    }
  }
  async requestTRC20TokenAllowance(token: Token) {
    const contract = window.tronWeb.contract(TRC20ABI, token);
    const address = window.tronWeb.defaultAddress.base58;

    try {
      const allowance = this.convertBadBigNumber(await contract.methods.allowance(address, ContractAddress.Swap).call());

      this._update$.next(state => state.tokens[token].allowance = allowance);
    } catch (e) {
      this._update$.next(state => state.tokens[token].allowance = new BigNumber(0));
    }
  }
  getTRC20TokenBalance$(token: Token) {
    if (!window.tronWeb)
      throw new Error("TronWeb not initialized");

    const contract = window.tronWeb.contract(TRC20ABI, token);

    return defer(async () => {
      const balance = await contract.methods.balanceOf(window.tronWeb.defaultAddress.base58).call();

      return this.convertBadBigNumber(balance);
    });
  }
  getTRC20TokenAllowance$(token: Token) {
    if (!window.tronWeb)
      throw new Error("TronWeb not initialized");

    const contract = window.tronWeb.contract(TRC20ABI, token);

    return defer(async () => {
      const allowance = await contract.methods.allowance(window.tronWeb.defaultAddress.base58, ContractAddress.Swap).call();

      return this.convertBadBigNumber(allowance);
    });
  }

  getToken$(token: Token): Observable<TokenInfo> {
    return this._state$.pipe(
      map(state => state.tokens[token]),
    );
  }

  delay(time: number) {
    return new Promise(resolve => setTimeout(resolve, time));
  }

  async approve(token: Token, amount: BigNumber) {
    if (!window.tronWeb)
      throw new Error("TronWeb not initialized");

    await window.tronWeb.contract(TRC20ABI, token).methods.approve(ContractAddress.Swap, '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF').send();

    await this.delay(5000);

    await this.requestTRC20TokenAllowance(token);
    await this.requestAccountBalance();
  }

  async addLiquidity(usdt: BigNumber, usdj: BigNumber) {
    const swapContract = window.tronWeb.contract(SwapABI, ContractAddress.Swap);
    const swapTokenContract = window.tronWeb.contract(TRC20ABI, ContractAddress.SwapToken);

    const amounts = [usdt.toFixed(), usdj.toFixed()];

    let minAmount = new BigNumber(0);
    const totalSupply = this.convertBadBigNumber(await swapTokenContract.methods.totalSupply().call());
    if (totalSupply.gt(0)) {
    }

    await swapContract.methods.add_liquidity(amounts, minAmount.toFixed(0)).send();

    await this.delay(5000);

    await this.requestAccountBalance();
    await this.requestTRC20TokenBalance(Token.USDT);
    await this.requestTRC20TokenBalance(Token.USDJ);
    await this.requestTRC20TokenBalance(Token.swUSD);
    await this.requestPoolInfo();
  }
  async removeLiquidity(amount: BigNumber) {
    const swapContract = window.tronWeb.contract(SwapABI, ContractAddress.Swap);

    const amounts = ['0', '0'];

    await swapContract.methods.remove_liquidity(amount.toFixed(0), amounts).send();

    await this.delay(5000);

    await this.requestAccountBalance();
    await this.requestTRC20TokenBalance(Token.USDT);
    await this.requestTRC20TokenBalance(Token.USDJ);
    await this.requestTRC20TokenBalance(Token.swUSD);
    await this.requestPoolInfo();
  }

  private convertBadBigNumber(value: any): BigNumber {
    if (value._ethersType === 'BigNumber')
      value = new BigNumber(value.toHexString());

    return value;
  }

  getTargetAmount$(token: Token, input: BigNumber) {
    return defer(async () => {
      try {
        const swapContract = window.tronWeb.contract(SwapABI, ContractAddress.Swap);

        const i = token === Token.USDT ? 0 : 1;
        const j = token === Token.USDT ? 1 : 0;
        const output = this.convertBadBigNumber(await swapContract.methods.get_dy_underlying(i, j, input.integerValue().toFixed()).call());
        return input.comparedTo(0) !== 0 ? output : new BigNumber(0);
      }
      catch (e) {
        console.error(e);
        return new BigNumber(0);
      }
    })
  }

  async swap(token: Token, amount: BigNumber) {
    const swapContract = window.tronWeb.contract(SwapABI, ContractAddress.Swap);

    const i = token === Token.USDT ? 0 : 1;
    const j = token === Token.USDT ? 1 : 0;

    await swapContract.methods.exchange(i, j, amount.toFixed(), '0').send();

    await this.delay(5000);

    await this.requestAccountBalance();
    await this.requestTRC20TokenBalance(Token.USDT);
    await this.requestTRC20TokenBalance(Token.USDJ);
  }

  getPositionInfo$(): Observable<PositionInfo | null> {
    return this.state$.pipe(
      map(state => {
        const lpTokenBalance = state.tokens[Token.swUSD].balance;
        if (lpTokenBalance.eq(0))
          return null;

        const poolShare = lpTokenBalance.div(state.pool.totalSupply);

        return {
          lpToken: state.tokens[Token.swUSD],
          pooledTokens: {
            usdt: {
              decimals: state.tokens[Token.USDT].decimals,
              balance: state.pool.usdtBalance.times(poolShare),
            },
            usdj: {
              decimals: state.tokens[Token.USDJ].decimals,
              balance: state.pool.usdjBalance.times(poolShare),
            }
          },
          share: poolShare.toNumber(),
        };
      }),
    )
  }
  async requestPoolInfo() {
    if (!window.tronWeb)
      throw new Error("TronWeb not initialized");

    const swapContract = window.tronWeb.contract(SwapABI, ContractAddress.Swap);
    const swapTokenContract = window.tronWeb.contract(TRC20ABI, ContractAddress.SwapToken);

    const totalSupply = this.convertBadBigNumber(await swapTokenContract.methods.totalSupply().call());
    const usdtBalance = this.convertBadBigNumber(await swapContract.methods.balances(0).call());
    const usdjBalance = this.convertBadBigNumber(await swapContract.methods.balances(1).call());

    this._update$.next(state => {
      state.pool.totalSupply = totalSupply;
      state.pool.usdtBalance = usdtBalance;
      state.pool.usdjBalance = usdjBalance;
    });
  }

  async isTransactionSuccess(transactionId: string) {
    try {
      const result = await window.tronWeb.trx.getTransaction(transactionId);

      return result.ret?.[0]?.contractRet === "SUCCESS";
    } catch {
      return false;
    }
  }
}

