import { Injectable } from '@angular/core';
import { BigNumber } from 'bignumber.js';
import { BehaviorSubject, Observable, Subject, defer, fromEvent, merge, combineLatest } from 'rxjs';
import { scan, filter, take, map, distinctUntilChanged, mergeMap, withLatestFrom, delay } from "rxjs/operators";

import TRC20ABI from '../constants/abis/TRC20.json';
import SwapABI from '../constants/abis/Swap.json';
import { ContractAddress } from '../constants/contracts';
import { Token } from '../constants/tokens';
import { TokenInfo } from '../types/TokenInfo';
import { PositionInfo } from '../types/PositionInfo';
import { TronInfo } from '../types/TronInfo';

export interface State {
  tronWeb: TronWebInstance | null,
  node: string,
  account: string;
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
    tronWeb: null,
    node: '',
    account: '',
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

  private _state$ = new BehaviorSubject<State>(getDefaultState());
  private _update$ = new Subject<(state: State) => void>();
  private _updateBalance$ = new Subject<void>();

  readonly state$: Observable<State>;
  readonly tron$: Observable<TronInfo>;

  constructor() {
    this._update$.pipe(
      scan((state: State, func: (state: State) => void) => {
        func(state);

        return state;
      }, getDefaultState())
    ).subscribe(this._state$);

    this._updateBalance$.pipe(
      withLatestFrom(this._state$),
      delay(0),
      mergeMap(([, state]) => defer(() => state.tronWeb!.trx.getBalance())),
      map(balance => (state: State) => state.balance = new BigNumber(balance)),
    ).subscribe(this._update$);

    this.state$ = this._state$.asObservable();
    this.tron$ = this.state$.pipe(
      filter(state => !!state.tronWeb && state.node !== '' && state.account !== ''),
      map(({ tronWeb, node, account, balance }) => <TronInfo>({ tronWeb, node, account, balance })),
    );
  }

  initialize() {
    const event$ = fromEvent<MessageEvent>(window, 'message').pipe(
      filter(event => typeof event.data === 'object' && (event.data?.isTronLink ?? false)),
      map(event => [event.data.message.action, event.data.message.data]),
    );
    const initial$ = event$.pipe(
      filter(([type, ]) => type === 'tabReply'),
      delay(0),
      map(([, data]) => data.data),
    );
    const node$ = merge(
      initial$.pipe(
        filter(data => typeof data.node.fullNode === 'string'),
        map(data => data.node.fullNode),
      ),
      event$.pipe(
        filter(([type, ]) => type === 'setNode'),
        map(([, data]) => data.node.fullNode),
      ),
    ).pipe(distinctUntilChanged());
    const account$ = merge(
      initial$.pipe(
        filter(data => typeof data.address === 'string'),
        map(data => data.address),
      ),
      event$.pipe(
        filter(([type, ]) => type === 'setAccount'),
        map(([, data]) => data.address),
      ),
    ).pipe(distinctUntilChanged());

    initial$.pipe(
      map(() => (state: State) => state.tronWeb = window.tronWeb),
    ).subscribe(this._update$);

    node$.pipe(
      map(node => (state: State) => {
        state.node = node;
        state.balance = new BigNumber(0);
      }),
    ).subscribe(this._update$);
    account$.pipe(
      map(account => (state: State) => {
        state.account = account;
        state.balance = new BigNumber(0);
      }),
    ).subscribe(this._update$);

    combineLatest([node$, account$, initial$]).pipe(
      map(() => undefined),
    ).subscribe(this._updateBalance$);
  }

  getInitialized$() {
    return this._state$.pipe(
      filter(state => !!state.tronWeb),
      take(1)
    );
  }

  getState$() {
    return this._state$.pipe(
      filter(state => !!state.tronWeb)
    );
  }

  requestAccountBalance() {
    if (!window.tronWeb)
      throw new Error("TronWeb not initialized");

    window.tronWeb.trx.getBalance().then(balance => {
      this._update$.next(state => {
        state.balance = new BigNumber(balance);
      });
    });
  }

  requestTRC20TokenBalance(token: Token) {
    if (!window.tronWeb)
      throw new Error("TronWeb not initialized");

    const contract = window.tronWeb.contract(TRC20ABI, token);

    contract.methods.balanceOf(window.tronWeb.defaultAddress.base58).call().then(result => {
      const balance = this.convertBadBigNumber(result);

      this._update$.next(state => {
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

      this._update$.next(state => {
        state.tokens[token].allowance = allowance;
      });
    });
  }

  getToken$(token: Token): Observable<TokenInfo> {
    return this._state$.pipe(
      filter(state => !!state.tronWeb),
      map(state => state.tokens[token])
    )
  }

  async approve(token: Token, amount: BigNumber) {
    if (!window.tronWeb)
      throw new Error("TronWeb not initialized");

    await window.tronWeb.contract(TRC20ABI, token).methods.approve(ContractAddress.Swap, amount.toString()).send({ shouldPollResponse: true });

    this.requestTRC20TokenAllowance(token);
    this._updateBalance$.next();
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

    this._updateBalance$.next();
  }
  async removeLiquidity(amount: BigNumber) {
    const swapContract = window.tronWeb.contract(SwapABI, ContractAddress.Swap);

    const amounts = ['0', '0'];

    await swapContract.methods.remove_liquidity(amount.toString(), amounts).send({ shouldPollResponse: true });

    this._updateBalance$.next();
  }

  private convertBadBigNumber(value: any) {
    if (value._ethersType === 'BigNumber')
      value = new BigNumber(value.toHexString());

    return value;
  }

  getTargetAmount$(token: Token, input: BigNumber) {
    return defer(async () => {
      const swapContract = window.tronWeb.contract(SwapABI, ContractAddress.Swap);

      const i = token === Token.USDT ? 0 : 1;
      const j = token === Token.USDT ? 1 : 0;

      return this.convertBadBigNumber(await swapContract.methods.get_dy_underlying(i, j, input.toString()).call());
    })
  }

  async swap(token: Token, amount: BigNumber) {
    const swapContract = window.tronWeb.contract(SwapABI, ContractAddress.Swap);

    const i = token === Token.USDT ? 0 : 1;
    const j = token === Token.USDT ? 1 : 0;

    await swapContract.methods.exchange(i, j, amount.toString(), '0').send({ shouldPollResponse: true });

    this._updateBalance$.next();
  }

  getPositionInfo$(): Observable<PositionInfo | null> {
    return this._state$.pipe(
      filter(state => !!state.tronWeb),
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
          }
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
}

